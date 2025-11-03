import { EarningsEvent } from "@/types";
import dayjs, { Dayjs } from "dayjs";
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_KEY = process.env.FINNHUB_KEY!;

export async function fetchWatchlistEarnings(
  now = dayjs(),
  symbols: string[],
  windowStart?: Dayjs, // inclusive
  windowEnd?: Dayjs // inclusive
): Promise<EarningsEvent[]> {
  const url = new URL(`${FINNHUB_BASE_URL}/calendar/earnings`);
  url.searchParams.set(
    "from",
    windowStart ? windowStart.format("YYYY-MM-DD") : now.startOf("month").format("YYYY-MM-DD")
  );
  url.searchParams.set(
    "to",
    windowEnd ? windowEnd.format("YYYY-MM-DD") : now.endOf("month").format("YYYY-MM-DD")
  );
  url.searchParams.set("token", FINNHUB_KEY);
  const r = await fetch(url.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error(`Earnings calendar fetch failed: ${r.status}`);
  const json = await r.json();
  // Filter to only watchlist earnings
  const watchlistEarnings = json.earningsCalendar.filter((item: any) =>
    symbols.includes(item.symbol)
  );
  // Sort by date ascending
  watchlistEarnings.sort((a: any, b: any) => {
    const dateA = dayjs(a.date);
    const dateB = dayjs(b.date);
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
  });
  return watchlistEarnings as EarningsEvent[];
}
