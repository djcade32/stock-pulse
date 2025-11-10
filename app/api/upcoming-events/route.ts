import { db } from "@/firebase/admin";
import { analyzeWeekEvents } from "@/lib/server/analyzers/analyzeWeekEvents";
import { EarningsEvent, MacroEvent } from "@/types";
import dayjs from "dayjs";
import { getAuth } from "firebase-admin/auth";
import { NextResponse } from "next/server";

const NO_ANALYSIS_RESULT =
  "This week was notably quiet on the economic and earnings front, with no major data releases or corporate reports to move the markets. Investors may find this lull an opportunity to digest recent developments and prepare for upcoming events. While the absence of fresh catalysts can lead to subdued trading, it also sets the stage for potential volatility once new information emerges. Keep an eye on next week’s calendar for key indicators and earnings that could reshape market sentiment.";

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

    if (!macroEventsJson.length && !watchlistEarningsJson.length) {
      console.warn("No macro events or watchlist earnings found for analysis");
      return NextResponse.json({
        week_analysis: NO_ANALYSIS_RESULT,
        range: { start, end },
      });
    }
    console.log("analyze-week-events: running analysis with", {
      macroEventsCount: macroEventsJson.length,
      watchlistEarningsCount: watchlistEarningsJson.length,
    });
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
