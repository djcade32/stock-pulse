import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { addWatchlistItem, WatchlistStock } from "@/lib/server/watchlist";
import { analyzeLatestReportForTicker } from "@/lib/server/reports/analyzeLatest";

// Tunables
const MAX_BATCH = 5; // cap per request to be safe on Vercel
const CONCURRENCY = 2; // analyze 2 at a time
const SOFT_TIMEOUT_MS = 50_000; // stop starting new work near 50s

type Result = { symbol: string; eventId?: string; deduped?: boolean; error?: string };

export async function POST(req: Request) {
  const started = Date.now();
  const timeLeft = () => SOFT_TIMEOUT_MS - (Date.now() - started);

  try {
    // Auth
    const authz = req.headers.get("authorization") || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { uid } = await getAuth().verifyIdToken(token);

    // Input
    const body = await req.json().catch(() => ({}));
    let stocks: WatchlistStock[] = Array.isArray(body?.stocks) ? body.stocks : [];
    stocks = stocks
      .map((s) => ({
        symbol: String(s.symbol || "").toUpperCase(),
        description: s.description ? String(s.description) : String(s.symbol || "").toUpperCase(),
      }))
      .filter((s) => s.symbol);
    if (!stocks.length)
      return NextResponse.json({ error: "stocks array required" }, { status: 400 });

    // 1) Fast: add all to watchlist doc array
    for (const s of stocks) {
      await addWatchlistItem(uid, s);
    }

    // 2) Analyze latest filing for each (early-exit avoids LLM if already done)
    stocks = stocks.slice(0, MAX_BATCH);
    const results: Result[] = [];
    const queue = [...stocks];

    const worker = async () => {
      while (queue.length) {
        if (timeLeft() <= 0) return;
        const s = queue.shift()!;
        try {
          const analyzed = await analyzeLatestReportForTicker(s.symbol);
          results.push({ symbol: s.symbol, eventId: analyzed.eventId, deduped: analyzed.deduped });
        } catch (e: any) {
          results.push({ symbol: s.symbol, error: e?.message || "failed" });
        }
      }
    };

    await Promise.allSettled(Array.from({ length: CONCURRENCY }, () => worker()));
    const partial = timeLeft() <= 0 && queue.length > 0;

    return NextResponse.json({ ok: true, analyzed: results, partial });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
