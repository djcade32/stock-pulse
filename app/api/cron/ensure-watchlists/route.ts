import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { getUserWatchlistTickers } from "@/lib/server/watchlist";
import { ensureTickersLatest } from "@/lib/server/reports/ensure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const db = getFirestore();

export async function POST(req: Request) {
  console.log("Ensuring watchlists are up to date...");
  try {
    const host = req.headers.get("host") || "";
    const isDev = process.env.NODE_ENV !== "production";

    console.log("Host:", host, "isDev:", isDev);

    // if (!isDev) {
    //   const allowed = host.endsWith("vercel.app") || host.includes("stock-pulse.com");

    //   if (!allowed) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    //   }
    // }

    // List all watchlists (IDs are userIds)
    const snap = await db.collection("watchlists").select("stocks").get();
    const userIds = snap.docs.map((d) => d.id);

    const summary: Array<{ userId: string; count: number; partial?: boolean; error?: string }> = [];

    for (const userId of userIds) {
      try {
        const tickers = await getUserWatchlistTickers(userId);
        if (!tickers.length) {
          summary.push({ userId, count: 0 });
          continue;
        }
        const { results, partial } = await ensureTickersLatest(tickers);
        summary.push({ userId, count: results.length, partial });
      } catch (e: any) {
        summary.push({ userId, count: 0, error: e?.message || "failed" });
      }
    }

    return NextResponse.json({ ok: true, users: summary });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
