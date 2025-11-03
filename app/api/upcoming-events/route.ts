import { db } from "@/firebase/admin";
import { analyzeWeekEvents } from "@/lib/server/analyzers/analyzeWeekEvents";
import { EarningsEvent, MacroEvent } from "@/types";
import dayjs from "dayjs";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // get uid from auth header if needed in future
    const authz = req.headers.get("authorization") || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { uid } = await getAuth().verifyIdToken(token);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // Get user watchlist symbols from firebase
    const doc = await db.collection("watchlists").doc(uid).get();
    const data = doc.data()?.stocks || [];
    const symbols = data.map((item: any) => item.symbol);

    const url = new URL(req.url);
    const origin = url.origin;

    const today = dayjs();
    const start = today.startOf("week").format("YYYY-MM-DD");
    const end = today.endOf("week").format("YYYY-MM-DD");

    // Use absolute URL on the server
    const macroRes = await fetch(`${origin}/api/macro-events?from=${start}&to=${end}`, {
      cache: "no-store",
    });

    if (!macroRes.ok) {
      return NextResponse.json({ error: "Failed getting macro events" }, { status: 500 });
    }

    const macroEventsJson = (await macroRes.json()).items as MacroEvent[];

    const earningsRes = await fetch(
      `${origin}/api/watchlist/earnings?from=${start}&to=${end}&symbols=${symbols.join(",")}`,
      { cache: "no-store" }
    );
    if (!earningsRes.ok) {
      return NextResponse.json({ error: "Failed getting watchlist earnings" }, { status: 500 });
    }
    const watchlistEarningsJson = (await earningsRes.json()).items as EarningsEvent[];

    const weekAnalysis = await analyzeWeekEvents({
      macroEvents: macroEventsJson,
      watchlistEarnings: watchlistEarningsJson,
    });

    return NextResponse.json({
      week_analysis: weekAnalysis,
      range: { start, end },
    });
  } catch (e: any) {
    console.error("analyze-week-events error:", e);
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
