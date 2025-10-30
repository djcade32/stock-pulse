import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getUserWatchlistStocks } from "@/lib/server/watchlist";
import { ensureTickersLatest } from "@/lib/server/reports/ensure";

const db = getFirestore();

export async function POST(req: Request) {
  try {
    const authz = req.headers.get("authorization") || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { uid } = await getAuth().verifyIdToken(token);

    const stocks = await getUserWatchlistStocks(uid);
    if (!stocks.length) return NextResponse.json({ ok: true, analyzed: [] });

    const { results, partial } = await ensureTickersLatest(stocks);
    await db
      .collection("watchlists")
      .doc(uid)
      .set({ lastEnsuredAt: FieldValue.serverTimestamp() }, { merge: true });

    return NextResponse.json({ ok: true, analyzed: results, partial });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
