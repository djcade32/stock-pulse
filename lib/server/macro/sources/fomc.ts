import { MacroEvent } from "@/types";
import { load } from "cheerio";
import dayjs, { Dayjs } from "dayjs";

const FOMC_URL = process.env.FOMC_URL!;

const monthMap: { [key: number]: string } = {
  0: "January",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export async function fetchFomcMeetings(
  now = dayjs(),
  windowStart?: Dayjs,
  windowEnd?: Dayjs
): Promise<MacroEvent[]> {
  const res = await fetch(FOMC_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`FOMC fetch failed: ${res.status}`);
  const html = await res.text();
  const $ = load(html);

  // Grab the first element with .panel classname
  const panelEl = $("div.panel-default").first();

  const all: MacroEvent[] = [];
  panelEl.find("div.row").each((index, el) => {
    const currentMonth = monthMap[index];
    const currentYear = now.year();
    if (!currentMonth) return;

    const text = $(el).text().trim();
    if (!text) return;

    const m = text.match(/(\d{1,2})\s*[-–—]\s*(\d{1,2})\*?/);
    const single = text.match(/([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/);

    if (m) {
      const [_, d1, d2] = m;
      const start = dayjs(`${currentMonth} ${d1}, ${currentYear}`);
      const end = dayjs(`${currentMonth} ${d2}, ${currentYear}`);
      all.push({
        id: "",
        title: "FOMC Meeting",
        category: "FOMC",
        date: start.format("YYYY-MM-DD"),
        span: { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") },
        source: "FED",
        sourceUrl: FOMC_URL,
        importance: 3,
        lastCheckedAt: now.toISOString(),
        hash: "",
      });
    } else if (single) {
      const [_, mon, d1, yr] = single;
      const day = dayjs(`${mon} ${d1}, ${yr}`);
      all.push({
        id: "",
        title: "FOMC Meeting",
        category: "FOMC",
        date: day.format("YYYY-MM-DD"),
        source: "FED",
        sourceUrl: FOMC_URL,
        importance: 3,
        lastCheckedAt: now.toISOString(),
        hash: "",
      });
    }
  });

  // de-dupe
  const uniq = new Map<string, MacroEvent>();
  for (const e of all) {
    const key = `${e.title}|${e.date}|${e.span?.end ?? ""}`;
    if (!uniq.has(key)) uniq.set(key, e);
  }
  const events = Array.from(uniq.values());

  // window filter (include single-day in window OR any span overlap)
  if (!windowStart && !windowEnd) return events;
  return events;
  //   return events.filter((e) => {
  //     const start = dayjs(e.date);
  //     const end = e.span ? dayjs(e.span.end) : start;
  //     const ws = windowStart ?? dayjs("1900-01-01");
  //     const we = windowEnd ?? dayjs("2999-12-31");
  //     return !(end.isBefore(ws, "day") || start.isAfter(we, "day"));
  //   });
}
