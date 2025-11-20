import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "nodejs";

type SentimentPayload = {
  label: "Bullish" | "Neutral" | "Bearish" | null;
  mspr: number | null;
};

type InsiderSummaryRow = {
  name: string;
  netShares: number;
  totalBuys: number;
  totalSells: number;
  lastTradeDate?: string | null;
  lastTradeCode?: string | null;
};

type RecentTx = {
  name: string;
  change: number;
  transactionCode: string;
  transactionDate: string;
  transactionPrice: number | null;
};

type RequestBody = {
  symbol: string;
  sentiment: SentimentPayload | null;
  summaryRows: InsiderSummaryRow[];
  recentTransactions: RecentTx[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { symbol, sentiment, summaryRows, recentTransactions } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    // Keep the payload small to control tokens
    const trimmedRecent = recentTransactions.slice(0, 10);
    const trimmedSummary = summaryRows.slice(0, 6);

    const messages = [
      {
        role: "system" as const,
        content: `
You are StockWisp's insider-activity analyst.

Your job is to translate raw insider trading data into a short, neutral insight for active investors. 
You:
- Explain who is buying or selling (executives, directors, major insiders).
- Highlight whether activity is net bullish, net bearish, or mixed based on the data.
- Call out any unusually large or notable trades.
- Explain how a reasonable investor might interpret this as one input in their process.

Strict rules:
- Length: 2–4 sentences.
- Tone: concise, professional, and calm.
- Do NOT give direct trading instructions or advice. Never say "you should buy", "you should sell", "this is a buy", or similar.
- Do NOT mention probabilities, certainty, or guarantees.
- Do NOT reference data you have not been given.
- Treat insider activity as a secondary signal that should be weighed alongside fundamentals, valuation, and broader market context.

Always end with a gentle caveat that insider activity is just one signal among many.
    `.trim(),
      },
      {
        role: "user" as const,
        content: JSON.stringify(
          {
            symbol,
            sentiment, // { label: 'Bullish' | 'Neutral' | 'Bearish' | null, mspr: number | null }
            summaryRows: trimmedSummary,
            recentTransactions: trimmedRecent,
            instructions: `
Write a 2–4 sentence summary explaining this insider activity for ${symbol}.

Structure:
1) Start with the overall read: whether insiders are net buyers, net sellers, or mixed in this period, and how that lines up with the sentiment label if provided.
2) Mention which types of insiders are most active (for example CEO, CFO, directors, or named insiders) and call out any especially large or notable trades by share size, NOT by dollar amount you have to infer.
3) Briefly explain how an investor might interpret this behavior (for example, "supports a constructive view", "looks more like profit-taking", or "signals caution from management") without telling them what to do.
4) End with a short caveat that insider activity should be used together with fundamentals, valuation, and broader market signals.

Style:
- Use plain language a serious retail or professional investor can scan quickly.
- Keep it objective and descriptive, not promotional.
- Do not address the reader as "you" when talking about actions; describe investors in general (e.g., "Some investors may view this as...").
- Do not repeat raw numbers exhaustively; only mention what is directionally important.
      `.trim(),
          },
          null,
          2
        ),
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages,
    });

    const aiText = completion.choices[0]?.message?.content?.trim() ?? "No AI summary available.";

    return NextResponse.json({ summary: aiText });
  } catch (err: any) {
    console.error("[INSIDERS_AI_SUMMARY_ERROR]", err);
    return NextResponse.json({ error: "Failed to generate AI insider summary" }, { status: 500 });
  }
}
