import ical from "ical";
import dayjs, { Dayjs } from "dayjs";
import { MacroEvent } from "@/types";

const BEA_ICS_URL = process.env.BEA_ICS_URL!;

const mapTitleToCategory = (t: string): MacroEvent["category"] => {
  const s = t.toLowerCase();
  if (s.includes("gdp")) return "GDP";
  if (s.includes("personal income") || s.includes("pce")) return "PCE";
  if (s.includes("international trade")) return "TRADE";
  return "OTHER";
};

export async function fetchBeaEvents(
  now = dayjs(),
  windowStart?: Dayjs,
  windowEnd?: Dayjs
): Promise<MacroEvent[]> {
  // BEA website is down so throw new Error("BEA ICS source currently unavailable");
  throw new Error("BEA ICS source currently unavailable");
  const res = await fetch(BEA_ICS_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`BEA fetch failed: ${res.status}`);
  const text = await res.text();
  const data = ical.parseICS(text);

  const out: MacroEvent[] = [];
  for (const k of Object.keys(data)) {
    const ev = data[k];
    if (ev.type !== "VEVENT" || !ev.start) continue;

    const dt = dayjs(ev.start as Date);
    if (windowStart && dt.isBefore(windowStart, "day")) continue;
    if (windowEnd && dt.isAfter(windowEnd, "day")) continue;

    const title: string = ev.summary || "BEA Release";
    const tm = dt.format("HH:mm");
    const category = mapTitleToCategory(title);

    out.push({
      id: "",
      title,
      category,
      date: dt.format("YYYY-MM-DD"),
      time: tm,
      tz: "America/New_York",
      source: "BEA",
      sourceUrl: BEA_ICS_URL,
      importance: ["GDP", "PCE", "TRADE"].includes(category) ? 3 : 2,
      lastCheckedAt: now.toISOString(),
      raw: { uid: ev.uid, location: ev.location },
      hash: "",
    });
  }
  return out;
}
