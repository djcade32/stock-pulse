import dayjs, { Dayjs } from "dayjs";
import { MacroEvent } from "@/types";

const FRED_KEY = process.env.FRED_API_KEY!;
const FRED_RELEASE_DATES = "https://api.stlouisfed.org/fred/release/dates";

type FredReleaseId = 53 | 54; // GDP=53, PCE/Personal Income & Outlays=54

async function fredReleaseDates(release_id: FredReleaseId, fromISO: string, toISO: string) {
  // fred/release/dates filters by realtime_start/end, not event window;
  // we filter returned dates client-side to [fromISO, toISO].
  const url = new URL(FRED_RELEASE_DATES);
  url.searchParams.set("api_key", FRED_KEY);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("release_id", String(release_id));
  // Use broad realtime window; the date we care about is in "release_dates[].date"
  url.searchParams.set("realtime_start", dayjs(fromISO).startOf("year").format("YYYY-MM-DD"));
  url.searchParams.set("realtime_end", dayjs(toISO).endOf("year").format("YYYY-MM-DD"));
  url.searchParams.set("include_release_dates_with_no_data", "true");

  const r = await fetch(url.toString(), { cache: "no-store" });
  if (!r.ok) throw new Error(`FRED release dates failed: ${r.status}`);
  const json = await r.json();
  return (json.release_dates || []) as { date: string }[];
}

export async function fetchBeaFromFred(
  now = dayjs(),
  windowStart?: Dayjs,
  windowEnd?: Dayjs
): Promise<MacroEvent[]> {
  if (!FRED_KEY) throw new Error("Missing FRED_API_KEY");

  const ws = (windowStart ?? now.startOf("month")).format("YYYY-MM-DD");
  const we = (windowEnd ?? now.endOf("month")).format("YYYY-MM-DD");

  // GDP + Personal Income & Outlays (PCE)
  const [gdpDates, pceDates] = await Promise.all([
    fredReleaseDates(53, ws, we),
    fredReleaseDates(54, ws, we),
  ]);

  const within = (d: string) => d >= ws && d <= we;

  const gdpEvents: MacroEvent[] = gdpDates
    .map((d) => d.date)
    .filter(within)
    .map((date) => ({
      id: "",
      title: "Gross Domestic Product (GDP)",
      category: "GDP",
      date,
      time: "08:30", // FRED provides date only; BEA standard is 8:30 ET
      tz: "America/New_York",
      source: "BEA",
      sourceUrl: "https://fred.stlouisfed.org/release?rid=53",
      importance: 3,
      lastCheckedAt: now.toISOString(),
      hash: "",
    }));

  const pceEvents: MacroEvent[] = pceDates
    .map((d) => d.date)
    .filter(within)
    .map((date) => ({
      id: "",
      title: "Personal Income and Outlays (PCE)",
      category: "PCE",
      date,
      time: "08:30",
      tz: "America/New_York",
      source: "BEA",
      sourceUrl: "https://fred.stlouisfed.org/release?rid=54",
      importance: 3,
      lastCheckedAt: now.toISOString(),
      hash: "",
    }));

  return [...gdpEvents, ...pceEvents];
}
