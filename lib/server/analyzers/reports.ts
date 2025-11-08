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
  "summary": { "tldr": string, "bullets": [{"bullet": string, "sentiment": "Positive" | "Negative" | "Neutral" }] },
  "themes": [{ "topic": string, "sentiment": number }],
  "kpis": [{ "name": string, "value": string, "unit": string|null, "yoyDelta": string|null, "qoqDelta": string|null }],
  "risks": [{ "label": string, "severity": number }],
  "flags": { "guidanceChange": boolean, "liquidityConcern": boolean, "marginInflection": boolean },
  "overallSentiment": "Bullish" | "Neutral" | "Bearish",
  "quarter": string // e.g. "Q2 2024"
  "revenue_performance": string | null, // e.g. "Strong iPhone 15 sales drove 2.1% revenue growth to $89.5B, exceeding analyst expectations despite macro headwinds."
  "risk_factors": string | null // e.g. "Risks include supply chain disruptions, competitive pressures, and regulatory challenges in key markets."
  "management_tone": string | null // e.g. "Management remains cautiously optimistic, emphasizing innovation and operational efficiency to navigate macro challenges."
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
- Extract explicit KPIs throughout the report such as, (revenue, EPS, gross margin, operating margin, FCF, cash, debt, segment revenue, backlog) if stated; put null for deltas if not stated. Do not use sentences with words like "increased" or "decreased".
- Only include string with number percentages for YoY or QoQ. (e.g. "5.2%", "-3.1%"). A bad example would be "increased significantly" or "Increase from 1,721 million at Dec 28, 2024". 
- Identify major themes throughout the report using simple phrases or single words. For example (Ad Revenue, Increased Spending, demand, pricing, margins, AI, capex, competition, supply chain, regulatory). Identify with sentiment between 1..10. 1 being very negative, 10 being very positive.
- Provide an overall sentiment of the report based on the themes and bullets. (e.g. "Bullish", "Bearish", "Neutral")
- List top risks (legal, supply, customer concentration, leverage, macro).
- Flags: mark guidanceChange if guidance was raised/lowered/introduced; liquidityConcern if cash burn, covenant risks, going concern; marginInflection if gross/operating margin materially turned.
- Provide the quarter that the report covers. Do not just based this off of the filing date because the fiscal year for some companies could be different. So get this value based off the specific companies fiscal year. (e.g., Q2 2024).
- Do not repeat the same KPI with the same or different names (e.g., "total revenue" and "revenues")
- The words I provided in parentheses are examples only. Use what you see fit according to the actual report.
- For revenue_performance, risk_factors, management_tone: provide a concise summary in 1-2 sentences if that information is explicitly stated in the report; otherwise use contextual clues to infer it.

${xbrlHint}

Filing text (verbatim from SEC, normalized):
${params.text}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-5-mini",
    // temperature: 0.2,
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
  parsed.overallSentiment ||= "Neutral";
  parsed.quarter ||= "Unknown";
  parsed.revenue_performance ||= null;
  parsed.risk_factors ||= null;
  parsed.management_tone ||= null;
  return parsed;
}
