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

async function fetchWithRetry(url: string, init: RequestInit, tries = 3) {
  console.log(`fetchWithRetry: Fetching URL with up to ${tries} tries: ${url}`);
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    console.log(`fetchWithRetry: Attempt ${i + 1} for URL: ${url}`);
    const res = await fetch(url, init);
    if (res.ok) return res;
    lastErr = new Error(`BLS fetch failed: ${res.status}`);
    if ([403, 429, 500, 502, 503, 504].includes(res.status)) {
      await new Promise((res) => setTimeout(res, 300 * Math.pow(2, i)));
      continue;
    }
    break;
  }
  throw lastErr;
}

export async function fetchBlsEvents(
  now = dayjs(),
  windowStart?: Dayjs, // inclusive
  windowEnd?: Dayjs // inclusive
): Promise<MacroEvent[]> {
  if (!BLS_ICS_URL) throw new Error("BLS_ICS_URL is not set");
  const res = await fetchWithRetry(
    BLS_ICS_URL,
    {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      headers: {
        "User-Agent": "StockWispBot/1.0 (+contact@stockwisp.app)",
        Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
        // Uncomment if the host needs it:
        // "Referer": "https://www.bls.gov/",
      },
    },
    3
  );

  console.log(`fetchBlsEvents: BLS ICS fetch status: ${res.status}`, {
    finalUrl: res.url,
    contentType: res.headers.get("content-type"),
  });

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
