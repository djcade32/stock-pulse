import { NextResponse } from "next/server";
import { formatDistanceToNow } from "date-fns";
import { persistLatestEarningsDate } from "@/lib/server/persistReports";

async function fetchCompanyNews(symbol: string) {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    symbol: symbol,
    from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 3 days ago format YYYY-MM-DD
    to: new Date().toISOString().slice(0, 10), // today
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/company-news?${qs}`);
  if (!resp.ok) throw new Error("Market news fetch failed");
  const raw = (await resp.json()) as Array<{
    category: string;
    headline: string;
    id: number;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
    datetime: number; // seconds
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
      related: a.related ? a.related.split(",") : [],
      sentiment: null as "Positive" | "Negative" | "Neutral" | null,
      publishedAt: a.datetime ? new Date(a.datetime) : new Date(),
      timeElapsed: formatDistanceToNow(a.datetime ? new Date(a.datetime * 1000) : new Date(), {
        addSuffix: true,
      }).replace("about ", ""),
    }))
    .filter((a) => a.title && a.url && !seen.has(a.url) && (seen.add(a.url), true));
  return items;
}

async function analyzeNewsSentiment(title: string) {
  // Placeholder: replace with real sentiment analysis (FinBERT/LLM/etc)
  const text = title.toLowerCase();
  const positives = [
    "beat",
    "surge",
    "record",
    "growth",
    "raise",
    "upgrade",
    "strong",
    "profit",
    "exceed",
    "gain",
    "rally",
    "optimistic",
    "bullish",
    "tops",
    "improve",
    "catalyst",
    "upbeat",
  ];
  const negatives = [
    "miss",
    "fall",
    "decline",
    "drop",
    "weak",
    "delay",
    "cut",
    "downgrade",
    "loss",
    "declining",
    "stumble",
    "pessimistic",
    "bearish",
    "warn",
    "warning",
    "investigation",
    "lawsuit",
    "fraud",
    "scandal",
    "selloff",
    "plunge",
    "slump",
    "sink",
    "crash",
    "vulnerability",
    "suffer",
  ];
  let score = 0;
  for (const p of positives) if (text.includes(p)) score++;
  for (const n of negatives) if (text.includes(n) && !text.includes("fed")) score--;
  if (score > 0) return "Positive";
  else if (score < 0) return "Negative";
  else return "Neutral";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = (searchParams.get("symbol") || "").toLowerCase();
    const news = await fetchCompanyNews(symbol);
    for (const item of news) {
      item["sentiment"] = await analyzeNewsSentiment(item.title);
    }

    return NextResponse.json({ data: news });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
