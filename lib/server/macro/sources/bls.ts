import ical from "ical";
import dayjs, { Dayjs } from "dayjs";
import { MacroEvent } from "@/types";

const BLS_ICS_URL = process.env.BLS_ICS_URL!;

const mapTitleToCategory = (t: string): MacroEvent["category"] => {
  const s = t.toLowerCase();
  if (s.includes("consumer price index")) return "CPI";
  if (s.includes("employment situation")) return "JOBS";
  if (s.includes("producer price index")) return "PPI";
  return "OTHER";
};

export async function fetchBlsEvents(
  now = dayjs(),
  windowStart?: Dayjs, // inclusive
  windowEnd?: Dayjs // inclusive
): Promise<MacroEvent[]> {
  const res = await fetch(BLS_ICS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`BLS fetch failed: ${res.status}`);
  const text = await res.text();
  const data = ical.parseICS(text);

  const out: MacroEvent[] = [];
  for (const k of Object.keys(data)) {
    const ev = data[k];
    if (ev.type !== "VEVENT" || !ev.start) continue;

    const dt = dayjs(ev.start as Date);
    if (windowStart && dt.isBefore(windowStart, "day")) continue;
    if (windowEnd && dt.isAfter(windowEnd, "day")) continue;

    const title: string = ev.summary || "BLS Release";
    const tm = dt.format("HH:mm");
    const category = mapTitleToCategory(title);

    out.push({
      id: "",
      title,
      category,
      date: dt.format("YYYY-MM-DD"),
      time: tm,
      tz: "America/New_York",
      source: "BLS",
      sourceUrl: BLS_ICS_URL,
      importance: ["CPI", "JOBS", "PPI"].includes(category) ? 3 : 2,
      lastCheckedAt: now.toISOString(),
      raw: { uid: ev.uid, location: ev.location },
      hash: "",
    });
  }
  return out;
}
