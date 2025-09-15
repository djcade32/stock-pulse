import { FilingAnalysis } from "@/types";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeFilingToJson(params: {
  ticker: string;
  formLabel: string; // "10-Q Q2 2025" or "10-K 2024"
  text: string;
  facts?: { [k: string]: any } | null; // optional XBRL
}): Promise<FilingAnalysis> {
  const system = `You are Stock Pulse’s financial filings analyst. Return STRICT JSON only and match the schema. Do not guess KPIs: only include figures explicitly present in the text (or XBRL facts if provided).`;
  const schema = `
{
  "summary": { "tldr": string, "bullets": string[] },
  "themes": [{ "topic": string, "sentiment": number }],
  "kpis": [{ "name": string, "value": string, "unit": string|null, "yoyDelta": string|null, "qoqDelta": string|null }],
  "risks": [{ "label": string, "severity": number }],
  "flags": { "guidanceChange": boolean, "liquidityConcern": boolean, "marginInflection": boolean }
}
`;

  const xbrlHint = params.facts
    ? `
XBRL hints (may assist reconciliation; do not invent numbers):
${JSON.stringify(Object.keys(params.facts).slice(0, 12))}
`
    : "";

  const user = `
Ticker: ${params.ticker}
Filing: ${params.formLabel}

Goals:
- Summarize MD&A and overall performance drivers in 4–6 bullets.
- Extract explicit KPIs throughout the report such as, (revenue, EPS, gross margin, operating margin, FCF, cash, debt, segment revenue, backlog) if stated; put null for deltas if not stated.
- Identify major themes throughout the report using simple phrases or single words. For example (Ad Revenue, Increased Spending, demand, pricing, margins, AI, capex, competition, supply chain, regulatory). Identify with sentiment between -1..1.
- List top risks (legal, supply, customer concentration, leverage, macro).
- Flags: mark guidanceChange if guidance was raised/lowered/introduced; liquidityConcern if cash burn, covenant risks, going concern; marginInflection if gross/operating margin materially turned.
- The words I provided in parentheses are examples only. Use what you see fit according to the actual report.

${xbrlHint}

Filing text (verbatim from SEC, normalized):
${params.text}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Schema:\n${schema}\n\n${user}` },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw) as FilingAnalysis;
  parsed.summary ||= { tldr: "", bullets: [] };
  parsed.themes ||= [];
  parsed.kpis ||= [];
  parsed.risks ||= [];
  parsed.flags ||= { guidanceChange: false, liquidityConcern: false, marginInflection: false };
  return parsed;
}
