import { ArticlePred } from "@/types";
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function analyzeStockToJson(params: {
  ticker: string;
  text: string;
  facts?: { [k: string]: any } | null; // optional XBRL
}): Promise<ArticlePred> {
  const system = `You are Stock Pulse’s financial analyst. Return STRICT JSON only and match the schema.`;
  const schema = `
{
  "sentiment": "positive" | "neutral" | " negative",
  "themes": [{ "topic": string, "sentiment": string }],
  "sentimentScore": number,
  "summary":  { "tldr": string, "bullets": string[] }
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

Goals:
- In 4–6 bullets summarize the stock's sentiment using article headlines and article summaries about the stock.
- Identify major themes throughout the report using simple phrases or single words. At least 1 - 5. For example (Ad Revenue, Increased Spending, demand, pricing, margins, AI, capex, competition, supply chain, regulatory, beat earnings, missed). Identify with sentiment of either Negative, Neutral, or Positive.
- Based off of all the article headlines, their summaries, and how recent the news is classify the overall sentiment as Positive, Neutral, or Negative.
- Provide a sentiment score between 0 and 100 indicating a sentiment score. 0 is very negative, 50 is neutral, and 100 is very positive. 
- The words I provided in parentheses are examples only. Use what you see fit according to the article's headlines and summaries.

${xbrlHint}

Article headlines and summaries (normalized):
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
  const parsed = JSON.parse(raw) as ArticlePred;
  parsed.summary ||= { tldr: "", bullets: [] };
  parsed.themes ||= [];
  parsed.sentimentScore ||= 0;
  parsed.sentiment ||= "neutral";
  return parsed;
}
