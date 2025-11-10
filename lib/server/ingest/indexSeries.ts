import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { getFirestore } from "firebase-admin/firestore";
import { getQuotes } from "../quotes-core";
dayjs.extend(utc);
dayjs.extend(tz);

const SYMBOLS = ["SPY", "QQQ", "IWM"] as const;
const TZ = "America/New_York";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function isMarketOpenET(d = new Date()) {
  const et = dayjs(d).tz(TZ);
  const dow = et.day(); // 0=Sun
  if (dow === 0 || dow === 6) return false; // weekend
  const mins = et.hour() * 60 + et.minute();
  const open = 9 * 60 + 30;
  const close = 16 * 60 + 0;
  // TODO: add NYSE holiday / half-day calendar gate if desired
  return mins >= open && mins <= close;
}

export async function ingestIndexSeries() {
  // Run frequently, but only write during market hours
  if (!isMarketOpenET()) return { skipped: true, reason: "market closed" };

  const now = dayjs().tz(TZ);
  const dateKey = now.format("YYYY-MM-DD");
  const tsMinute = now.second(0).millisecond(0).valueOf();

  const quotes = await getQuotes(SYMBOLS as unknown as string[]);
  const db = getFirestore();

  const batch = db.batch();
  for (const q of quotes) {
    const ref = db.doc(`indexSeries/${dateKey}/symbols/${q.symbol}`);
    const snap = await ref.get();
    const data = snap.exists
      ? snap.data()!
      : {
          date: dateKey,
          tz: TZ,
          resolution: "1m",
          series: [] as Array<{ t: number; p: number }>,
        };

    const series = (data.series ?? []) as Array<{ t: number; p: number }>;
    const last = series[series.length - 1];
    if (!last || last.t !== tsMinute) series.push({ t: tsMinute, p: round2(q.last) });
    else last.p = round2(q.last); // replace current minute with freshest price

    batch.set(ref, { ...data, series, lastUpdated: new Date() }, { merge: true });
  }

  await batch.commit();
  return { skipped: false, wroteAt: tsMinute, symbols: quotes.map((q) => q.symbol) };
}
