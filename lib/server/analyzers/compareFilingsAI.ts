import { CompareFilingsAIResult } from "@/types";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function compareFilingsToJson(
  textA: string,
  textB: string
): Promise<CompareFilingsAIResult> {
  const system = `You are Stock Pulse’s financial filings analyst. I want you to analyze and compare the overall *outlook* of two SEC filings. Return STRICT JSON only and match the schema.`;
  const schema = `
{
  "comparisonTitle": string, // e.g. "COMPANY_A (Q2 2025) vs COMPANY_B (Q1 2025)"
  "aiVerdict": {
    "growthEdge": string,
    "stabilityEdge": string,
    "overallOutlook": string,
    "investmentSummary": {
      "momentumInvestors": string,
      "riskAverseInvestors": string
    }
  }
}
`;

  const user = `
Ignore detailed financial line items. Focus only on forming a professional outlook analysis that includes:

1. **Growth momentum** — Which company shows stronger near-term growth prospects and why.
2. **Risk exposure** — Which company faces higher or lower regulatory, macro, or competitive risk.
3. **Management tone** — Compare optimism, confidence, or caution reflected in the filings.
4. **Profitability and execution** — Briefly mention if margin discipline or operating leverage is improving.
5. **Final AI Verdict** — State in 3–5 sentences which company has the better outlook overall and why.

Then output in the following JSON format only:

{
  "comparisonTitle": "COMPANY_A (Q2 2025) vs COMPANY_B (Q1 2025)",
  "aiVerdict": {
    "growthEdge": "Which company has stronger near-term growth momentum and evidence supporting it",
    "stabilityEdge": "Which company demonstrates better risk management or consistency",
    "overallOutlook": "Concise conclusion comparing both outlooks in clear analytical language",
    "investmentSummary": {
      "momentumInvestors": "Which company is better for growth-focused investors and why",
      "riskAverseInvestors": "Which company is better for conservative investors and why"
    }
  }
}

Formatting rules:
- Keep all text in professional analyst tone.
- Use direct evidence or phrasing from the filings where possible (management tone, guidance, commentary).
- Limit response to outlook-level insights only — no full financial breakdowns.
- Keep output clean, factual, and ready for insertion into StockPulse’s AI Verdict card.

Company A filing text (verbatim from SEC, normalized):
${textA}

Company B filing text (verbatim from SEC, normalized):
${textB}
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
  const parsed = JSON.parse(raw) as CompareFilingsAIResult;
  return parsed;
}
