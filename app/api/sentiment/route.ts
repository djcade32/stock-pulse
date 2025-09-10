import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";

// ----- Config knobs
const STALE_MINUTES = 45; // recompute sentiment if older than this
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

// ----- Extremely simple, swappable sentiment adapter
type SentimentLabel = "positive" | "neutral" | "negative";
type ArticlePred = { label: SentimentLabel; confidence: number; keyPhrases: string[] };

// MVP analyzer: rule-based as a placeholder (upgrade later to FinBERT/LLM)
function cheapHeuristicAnalyze(text: string): ArticlePred {
  const t = text.toLowerCase();
  const positives = ["beat", "surge", "record", "growth", "raise", "upgrade", "strong", "profit"];
  const negatives = ["miss", "plunge", "cut", "downgrade", "lawsuit", "recall", "loss", "probe"];
  let score = 0;
  positives.forEach((p) => {
    if (t.includes(p)) score += 1;
  });
  negatives.forEach((n) => {
    if (t.includes(n)) score -= 1;
  });
  const label: SentimentLabel = score > 0 ? "positive" : score < 0 ? "negative" : "neutral";
  const keyPhrases = Array.from(new Set([...positives, ...negatives].filter((w) => t.includes(w))));
  const confidence = Math.min(1, Math.abs(score) / 3 || 0.3);
  return { label, confidence, keyPhrases };
}

// Optional: swap to a real model later (FinBERT or LLM)
// async function finbertAnalyzeBatch(texts: string[]): Promise<ArticlePred[]> { ... }
// async function llmAnalyzeBatch(texts: string[]): Promise<ArticlePred[]> { ... }

function aggregate(
  articles: Array<{
    title: string;
    summary: string;
    publishedAt: Date;
    pred: ArticlePred;
  }>
) {
  if (!articles.length) {
    return {
      score: 50,
      counts: { positive: 0, neutral: 0, negative: 0 },
      tags: [] as { tag: string; sentiment: "Positive" | "Neutral" | "Negative"; count: number }[],
      summary: "No recent coverage.",
      numOfNews: 0,
    };
  }

  // Time-decay weighting: newer articles count more
  const now = Date.now();
  const weighted = articles.map((a) => {
    const ageH = Math.max(1, (now - a.publishedAt.getTime()) / (1000 * 60 * 60));
    const w = 1 / Math.sqrt(ageH); // gentle decay
    const s = a.pred.label === "positive" ? 1 : a.pred.label === "negative" ? -1 : 0;
    return { w, s, pred: a.pred };
  });

  const wSum = weighted.reduce((acc, x) => acc + x.w, 0);
  const raw = weighted.reduce((acc, x) => acc + x.w * x.s * x.pred.confidence, 0) / (wSum || 1);
  // Map -1..1 to 0..100
  const score = Math.round(((raw + 1) / 2) * 100);

  const counts = weighted.reduce(
    (acc, x) => {
      const l = x.pred.label;
      acc[l] += 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  // Simple tag rollup
  const tagMap = new Map<string, { Positive: number; Neutral: number; Negative: number }>();
  articles.forEach((a) => {
    a.pred.keyPhrases.forEach((k) => {
      const cap =
        a.pred.label === "positive"
          ? "Positive"
          : a.pred.label === "negative"
          ? "Negative"
          : "Neutral";
      if (!tagMap.has(k)) tagMap.set(k, { Positive: 0, Neutral: 0, Negative: 0 });
      tagMap.get(k)![cap] += 1;
    });
  });
  const tags = Array.from(tagMap.entries())
    .map(([tag, c]) => {
      const sentiment =
        c.Positive >= c.Negative && c.Positive >= c.Neutral
          ? "Positive"
          : c.Negative >= c.Positive && c.Negative >= c.Neutral
          ? "Negative"
          : "Neutral";
      const count = Math.max(c.Positive, c.Negative, c.Neutral);
      return { tag, sentiment, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const summary =
    score >= 66
      ? "Overall positive coverage in recent articles."
      : score <= 34
      ? "Coverage skews negative in the last few days."
      : "Coverage is mixed/neutral recently.";

  return {
    score,
    counts,
    tags,
    summary,
    numOfNews: articles.length,
  };
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
  const analyzed = news.map((n) => {
    const text = `${n.title}. ${n.summary}`.trim();
    const pred = cheapHeuristicAnalyze(text);
    return { ...n, pred };
  });
  const agg = aggregate(analyzed);

  const toStore = {
    score: agg.score,
    counts: agg.counts,
    tags: agg.tags,
    summary: agg.summary,
    numOfNews: agg.numOfNews,
    updatedAt: new Date(),
  };

  await ref.set(toStore, { merge: true });
  return toStore;
}

export async function GET(req: NextRequest) {
  console.log("Sentiment API called");
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
