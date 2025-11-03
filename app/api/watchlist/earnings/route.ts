import { fetchWatchlistEarnings } from "@/lib/server/fetchWatchlistEarnings";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const symbolsParam = url.searchParams.get("symbols") || "";
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const now = dayjs();
  const windowStart = fromParam ? dayjs(fromParam) : now.startOf("month");
  const windowEnd = toParam ? dayjs(toParam) : now.endOf("month");

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);

  try {
    const earnings = await fetchWatchlistEarnings(now, symbols, windowStart, windowEnd);

    return NextResponse.json(
      { ok: true, count: earnings.length, items: earnings },
      {
        headers: { "cache-control": "s-maxage=10, stale-while-revalidate=20" },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
