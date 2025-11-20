// app/api/insiders/[symbol]/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  FinnhubInsiderResponse,
  FinnhubInsiderSentimentResponse,
  FinnhubInsiderTransaction,
  InsidersApiResponse,
  InsiderSentimentSummary,
  InsiderSummaryRow,
} from "@/types";
import { buildInsiderSummary } from "@/lib/server/insiders";
import OpenAI from "openai";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function pickLatestSentiment(
  res: FinnhubInsiderSentimentResponse | null
): InsiderSentimentSummary | undefined {
  if (!res || !res.data || res.data.length === 0) return undefined;

  // Finnhub returns multiple months; take the last chronologically
  const sorted = [...res.data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const latest = sorted[sorted.length - 1];

  return {
    latestMspr: latest.mspr ?? null,
    latestChange: latest.change ?? null,
    latestYear: latest.year ?? null,
    latestMonth: latest.month ?? null,
  };
}

async function buildInsiderSentiment(symbol: string, data: InsiderSummaryRow[] | undefined | null) {
  if (!data || data.length === 0) return null;
  const messages = [
    {
      role: "system" as const,
      content: `
You are StockWisp's insider-activity analyst.

Your job is to translate raw insider trading data into a Bullish, Bearish, or Neutral signal for active investors. 
You:
- Use the current market conditions and the current companies outlook to determine a signal for this insider activity.

Strict rules:
- Only respond with one of the three labels: "Bullish", "Neutral", or "Bearish".
- Do not provide any additional explanation or text.
    `.trim(),
    },
    {
      role: "user" as const,
      content: JSON.stringify(
        {
          symbol,
          summaryRows: data,
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

  const label = completion.choices[0]?.message?.content?.trim();

  if (label === "Bullish" || label === "Neutral" || label === "Bearish") {
    return label;
  }

  return null;
}

export async function GET(req: NextRequest, { params }: { params: { symbol: string } }) {
  const apiKey = process.env.FINNHUB_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "FINNHUB_KEY is not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = params.symbol.toUpperCase();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const now = new Date();
  const to = toParam ?? formatDate(now);

  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const from = fromParam ?? formatDate(sixMonthsAgo);

  const txUrl = `${FINNHUB_BASE_URL}/stock/insider-transactions?symbol=${encodeURIComponent(
    symbol
  )}&from=${from}&to=${to}&token=${apiKey}`;

  try {
    // Fetch both in parallel
    const [txRes] = await Promise.all([
      fetch(txUrl, { cache: "no-store", headers: { Accept: "application/json" } }),
    ]);

    if (!txRes.ok) {
      const text = await txRes.text();
      return NextResponse.json(
        {
          error: "Failed to fetch insider transactions from Finnhub",
          status: txRes.status,
          detail: text,
        },
        { status: 502 }
      );
    }

    const txJson = (await txRes.json()) as FinnhubInsiderResponse;

    const nonDerivative = (txJson.data ?? []).filter((tx) => !tx.isDerivative);

    const summary = buildInsiderSummary(nonDerivative);
    const sentiment = await buildInsiderSentiment(symbol, summary);

    const payload: InsidersApiResponse = {
      symbol: txJson.symbol,
      from,
      to,
      count: nonDerivative.length,
      summary,
      data: nonDerivative,
      sentiment,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[INSIDERS_API_ERROR]", err);
    return NextResponse.json({ error: "Unexpected error fetching insider data" }, { status: 500 });
  }
}
