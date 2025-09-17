import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { analyzeStockToJson } from "@/lib/server/analyzers/stocks";
import { TickerSentiment } from "@/types";

// ----- Config knobs
const STALE_MINUTES = 4320; // recompute sentiment if older than 3 daysa (minutes)
const LOOKBACK_DAYS = 3; // how far back to fetch news

// ----- Fetch company news (Finnhub or your provider)
async function fetchCompanyNews(ticker: string) {
  const token = process.env.FINNHUB_KEY!;
  const to = new Date();
  const from = new Date(to.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  const qs = new URLSearchParams({
    symbol: ticker,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/company-news?${qs}`);
  if (!resp.ok) throw new Error(`News fetch failed for ${ticker}`);
  const raw = (await resp.json()) as Array<{
    id?: number;
    datetime?: number; // seconds
    headline: string;
    summary: string;
    source: string;
    url: string;
  }>;
  // Normalize + dedupe by URL/headline
  const seen = new Set<string>();
  const items = raw
    .map((a) => ({
      id: String(a.id ?? a.url ?? a.headline),
      title: a.headline ?? "",
      summary: a.summary ?? "",
      source: a.source ?? "unknown",
      url: a.url,
      publishedAt: a.datetime ? new Date(a.datetime * 1000) : new Date(),
    }))
    .filter((a) => a.title && a.url && !seen.has(a.url) && (seen.add(a.url), true));
  return items;
}

async function computeOrReadCached(ticker: string) {
  const ref = db.doc(`sentiments/${ticker}`);
  const snap = await ref.get();

  if (snap.exists) {
    console.log(`Found cached sentiment for ${ticker}`);
    const data = snap.data() as any;
    const updatedAt = data.updatedAt?.toDate?.() ?? data.updatedAt;
    const ageMin = updatedAt ? (Date.now() - updatedAt.getTime()) / 60000 : 9999;
    if (ageMin < STALE_MINUTES) return data;
  }

  console.log(`Recomputing sentiment for ${ticker}...`);
  const news = await fetchCompanyNews(ticker);

  const analysis = await analyzeStockToJson({
    ticker,
    text: news.map((a) => `${a.title}. ${a.summary}`).join("\n"),
  });

  const toStore: TickerSentiment = {
    ticker,
    score: analysis.sentimentScore,
    tags: analysis.themes,
    summary: analysis.summary.tldr,
    numOfNews: news.length,
    updatedAt: new Date(),
  };

  await ref.set(toStore, { merge: true });
  return toStore;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tickersParam = url.searchParams.get("tickers") ?? "";
    const tickers = tickersParam
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);
    if (!tickers.length) return NextResponse.json({ error: "tickers required" }, { status: 400 });
    console.log(`Computing sentiment for: ${tickers.join(", ")}`);

    const results = await Promise.all(
      tickers.map(async (t) => {
        try {
          const s = await computeOrReadCached(t);
          return { ticker: t, ...s };
        } catch (err) {
          return { ticker: t, error: (err as Error).message };
        }
      })
    );

    return NextResponse.json({ data: results });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
