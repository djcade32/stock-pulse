import { load } from "cheerio";
import dayjs, { Dayjs } from "dayjs";
import { MacroEvent } from "@/types";

const CENSUS_URL = process.env.CENSUS_TRADE_SCHEDULE_URL!;

export async function fetchTradeFromCensus(
  now = dayjs(),
  windowStart?: Dayjs,
  windowEnd?: Dayjs
): Promise<MacroEvent[]> {
  const r = await fetch(CENSUS_URL, { cache: "no-store" });
  if (!r.ok) throw new Error(`Census trade schedule failed: ${r.status}`);
  const html = await r.text();
  const $ = load(html);

  // The page lists rows like: "January 2025  March 6, 2025  THU"
  const items: MacroEvent[] = [];
  $("table,tr,li,p").each((_, el) => {
    const txt = $(el).text().replace(/\s+/g, " ").trim();
    const m = txt.match(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/);
    if (!m) return;
    const [, mon, day, yr] = m;
    const date = dayjs(`${mon} ${day}, ${yr}`);
    if (!date.isValid()) return;

    items.push({
      id: "",
      title: "U.S. International Trade in Goods and Services (FT900)",
      category: "TRADE",
      date: date.format("YYYY-MM-DD"),
      time: "08:30",
      tz: "America/New_York",
      source: "BEA", // joint BEA/Census report, keep source aligned
      sourceUrl: CENSUS_URL,
      importance: 3,
      lastCheckedAt: now.toISOString(),
      hash: "",
    });
  });

  // de-dupe + window filter
  const uniq = new Map(items.map((e) => [e.date, e]));
  const all = Array.from(uniq.values());

  if (!windowStart && !windowEnd) return all;
  const ws = windowStart ?? dayjs("1900-01-01");
  const we = windowEnd ?? dayjs("2999-12-31");

  return all.filter((e) => {
    const d = dayjs(e.date);
    return !d.isBefore(ws, "day") && !d.isAfter(we, "day");
  });
}
