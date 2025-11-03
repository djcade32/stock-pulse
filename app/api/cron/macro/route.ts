import { finalize } from "@/lib/server/macro/normalize";
import { fetchBeaEvents } from "@/lib/server/macro/sources/bea";
import { fetchBeaFromFred } from "@/lib/server/macro/sources/bea_fallback";
import { fetchBlsEvents } from "@/lib/server/macro/sources/bls";
import { fetchTradeFromCensus } from "@/lib/server/macro/sources/census_trade";
import { fetchFomcMeetings } from "@/lib/server/macro/sources/fomc";
import { replaceMonthEvents } from "@/lib/server/macro/store";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  // Allow explicit window (?from=YYYY-MM-01&to=YYYY-MM-31), else default to current month.
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const now = dayjs();
  const windowStart = fromParam ? dayjs(fromParam) : now.startOf("month");
  const windowEnd = toParam ? dayjs(toParam) : now.endOf("month");

  try {
    const [bls, beaPrimary, fomc] = await Promise.allSettled([
      fetchBlsEvents(now, windowStart, windowEnd),
      fetchBeaEvents(now, windowStart, windowEnd),
      fetchFomcMeetings(now, windowStart, windowEnd),
    ]);
    let bea = beaPrimary.status === "fulfilled" ? beaPrimary.value : [];
    if (beaPrimary.status === "rejected") {
      // Fall back: GDP + PCE via FRED + Trade via Census
      const [beaFromFred, tradeFromCensus] = await Promise.all([
        fetchBeaFromFred(now, windowStart, windowEnd),
        fetchTradeFromCensus(now, windowStart, windowEnd),
      ]);
      bea = [...beaFromFred, ...tradeFromCensus];
    }

    const finalized = finalize([
      ...(bls.status === "fulfilled" ? bls.value : []),
      ...bea,
      ...(fomc.status === "fulfilled" ? fomc.value : []),
    ]);

    const counts: Record<string, number | string> = {
      bls: bls.status === "fulfilled" ? bls.value.length : `ERROR: ${bls.reason?.message}`,
      fomc: fomc.status === "fulfilled" ? fomc.value.length : `ERROR: ${fomc.reason?.message}`,
      bea: beaPrimary.status === "fulfilled" ? beaPrimary.value.length : `fallback (${bea.length})`, // when BEA failed but fallback succeeded
    };

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        mode: "dryRun",
        window: { from: windowStart.format("YYYY-MM-DD"), to: windowEnd.format("YYYY-MM-DD") },
        counts,
        sample: finalized.slice(0, 3),
      });
    }

    // await upsertChangedOnly(finalized);
    const res = await replaceMonthEvents(
      finalized,
      windowStart.format("YYYY-MM-DD"),
      windowEnd.format("YYYY-MM-DD")
    );

    return NextResponse.json({
      ok: true,
      added: finalized.length,
      window: {
        start: windowStart.format("YYYY-MM-DD"),
        end: windowEnd.format("YYYY-MM-DD"),
      },
      counts,
      ...res,
    });
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ ok: false, error: err?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
