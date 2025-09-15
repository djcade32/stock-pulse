import { NextResponse } from "next/server";
import { getUserWatchlistTickers } from "@/lib/server/watchlist";
import { analyzeLatestReportForTicker } from "@/lib/server/reports/analyzeLatest";
import { POPULAR_TICKERS } from "@/lib/server/constants/popularTickers";
import { db } from "@/firebase/admin";
import { collection, getDocs, orderBy, query, where, limit, doc, getDoc } from "firebase/firestore";
import { format } from "date-fns";
import { AITag } from "@/types";

type Row = {
  date: string;
  ticker: string;
  name: string;
  quarter: string;
  insights: string;
  aiTags: AITag[];
  overallSentiment: "Bullish" | "Neutral" | "Bearish";
  sourceUrl?: string;
};

function s2overall(score: number): "Bullish" | "Neutral" | "Bearish" {
  if (score > 0.15) return "Bullish";
  if (score < -0.15) return "Bearish";
  return "Neutral";
}
function s2tag(s: number): "Positive" | "Negative" | "Neutral" {
  if (s > 0.15) return "Positive";
  if (s < -0.15) return "Negative";
  return "Neutral";
}

async function ensureLatestForTickers(tickers: string[]) {
  for (const t of tickers) {
    try {
      await analyzeLatestReportForTicker(t);
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
}

async function rowsForTickers(tickers: string[]): Promise<Row[]> {
  if (!tickers.length) return [];
  const slice = tickers.slice(0, 10); // Firestore IN limit
  const snapRef = db.collection("filingAnalyses");
  const snapQuery = snapRef.where("ticker", "in", slice).orderBy("createdAt", "desc").limit(100);
  const snap = await snapQuery.get();

  const latestByTicker = new Map<string, any>();
  snap.docs.forEach((d) => {
    const a = d.data();
    const t = (a?.ticker || "").toUpperCase();
    if (!t) return;
    if (!latestByTicker.has(t)) latestByTicker.set(t, { id: d.id, ...a });
  });

  const rows: Row[] = [];
  for (const [ticker, a] of latestByTicker) {
    const eSnapRef = db.doc(`filingEvents/${a.id}`);
    const eSnap = await eSnapRef.get();
    const event = eSnap.exists ? (eSnap.data() as any) : {};
    const companySnapRef = db.doc(`companies/${ticker}`);
    const companySnap = await companySnapRef.get();
    const name = companySnap.exists ? (companySnap.data() as any).name : ticker;

    const filingDate = a?.filingDate || event?.filingDate || new Date().toISOString();
    const date = format(new Date(filingDate), "MMM d, yyyy");

    let quarter = "—";
    if (a?.form === "10-K") {
      quarter = `10-K ${new Date(filingDate).getFullYear()}`;
    } else if (a?.form === "10-Q") {
      const q = Math.floor(new Date(filingDate).getMonth() / 3) + 1;
      quarter = `10-Q Q${q} ${new Date(filingDate).getFullYear()}`;
    }

    const tldr = a?.summary?.tldr?.trim();
    const bullets = (a?.summary?.bullets ?? []).slice(0, 2).join(" • ");
    const insights = tldr || bullets || "No summary available.";

    const themes = a?.themes ?? [];
    const aiTags = themes
      .slice(0, 6)
      .map((t: any) => ({ topic: t.topic, sentiment: s2tag(t.sentiment) }));
    const avg = themes.length
      ? themes.reduce((acc: number, t: any) => acc + (t.sentiment ?? 0), 0) / themes.length
      : 0;
    const overallSentiment = s2overall(avg);

    rows.push({
      date,
      ticker,
      name,
      quarter,
      insights,
      aiTags,
      overallSentiment,
      sourceUrl: a?.provenance?.sourceUrl,
    });
  }
  rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return rows;
}

/** POST { userId: string }
 *  If user has watchlist tickers, ensure & return them; else ensure & return popular tickers.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body.userId || "").trim();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const watch = (await getUserWatchlistTickers(userId)).map((s) => s.toUpperCase());
    if (watch.length > 0) {
      await ensureLatestForTickers(watch);
      const rows = await rowsForTickers(watch);
      return NextResponse.json({ source: "watchlist", rows });
    }

    const popular = POPULAR_TICKERS.slice(0, 8).map((s) => s.toUpperCase());
    await ensureLatestForTickers(popular);
    const rows = await rowsForTickers(popular);
    return NextResponse.json({ source: "popular", rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
