import timezone from "dayjs/plugin/timezone";
import admin from "firebase-admin";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { getQuotes } from "../quotes-core";
import { firestoreAdmin } from "../firestoreAdmin";
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

dayjs.extend(utc);
dayjs.extend(timezone);

const DELETE_CONCURRENCY = 3; // keep low to avoid spikes/timeouts

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency = DELETE_CONCURRENCY
) {
  const queue = [...items];
  const runners = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const item = queue.shift()!;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export async function pruneDbIndexSeries() {
  console.log("Pruning old index series data...");
  const db = firestoreAdmin();

  // keep last 3 days of data (in TZ), delete anything strictly before cutoff date
  const cutoff = dayjs().tz(TZ).subtract(3, "day").startOf("day").format("YYYY-MM-DD");

  // Get all day docs older than cutoff
  const snap = await db
    .collection("indexSeries")
    .where(admin.firestore.FieldPath.documentId(), "<", cutoff)
    .get();

  console.log(`Cutoff=${cutoff}. Found ${snap.size} day docs to delete.`);

  if (snap.empty) return { deletedDays: 0, cutoff };

  const refs = snap.docs.map((d) => d.ref);

  // Prefer recursive delete (deletes doc + all nested subcollections)
  const hasRecursiveDelete = typeof (db as any).recursiveDelete === "function";

  if (hasRecursiveDelete) {
    await runWithConcurrency(refs, async (ref) => {
      console.log(`Recursive deleting day doc: ${ref.path}`);
      await (db as any).recursiveDelete(ref);
    });
    console.log(`Deleted ${refs.length} day docs via recursiveDelete.`);
    return { deletedDays: refs.length, cutoff, method: "recursiveDelete" as const };
  }

  // Fallback: manually delete symbols subcollection docs, then delete the day doc.
  // NOTE: This assumes only one subcollection ("symbols") under each day doc.
  // If you add more nested collections later, add them here too.
  await runWithConcurrency(refs, async (dayRef) => {
    console.log(`Manually deleting day doc tree: ${dayRef.path}`);

    // Delete all symbol docs under indexSeries/{dateDoc}/symbols/*
    while (true) {
      const symSnap = await dayRef.collection("symbols").limit(450).get();
      if (symSnap.empty) break;

      const batch = db.batch();
      symSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // Delete the day doc itself
    await dayRef.delete();
  });

  console.log(`Deleted ${refs.length} day docs via manual fallback.`);
  return { deletedDays: refs.length, cutoff, method: "manual" as const };
}

// export async function ingestIndexSeries() {
//   // Run frequently, but only write during market hours
//   if (!isMarketOpenET()) return { skipped: true, reason: "market closed" };

//   const now = dayjs().tz(TZ);
//   const dateKey = now.format("YYYY-MM-DD");
//   const tsMinute = now.second(0).millisecond(0).valueOf();

//   const quotes = await getQuotes(SYMBOLS as unknown as string[]);
//   const db = firestoreAdmin();

//   const batch = db.batch();
//   for (const q of quotes) {
//     const ref = db.doc(`indexSeries/${dateKey}/symbols/${q.symbol}`);
//     const snap = await ref.get();
//     const data = snap.exists
//       ? snap.data()!
//       : {
//           date: dateKey,
//           tz: TZ,
//           resolution: "1m",
//           series: [] as Array<{ t: number; p: number }>,
//         };

//     const series = (data.series ?? []) as Array<{ t: number; p: number }>;
//     const last = series[series.length - 1];
//     if (!last || last.t !== tsMinute) series.push({ t: tsMinute, p: round2(q.last) });
//     else last.p = round2(q.last); // replace current minute with freshest price

//     batch.set(ref, { ...data, series, lastUpdated: new Date() }, { merge: true });
//   }

//   await batch.commit();
//   return { skipped: false, wroteAt: tsMinute, symbols: quotes.map((q) => q.symbol) };
// }

export async function ingestIndexSeries() {
  // Run frequently, but only write during market hours
  if (!isMarketOpenET()) return { skipped: true, reason: "market closed" };

  const now = dayjs().tz(TZ);
  const dateKey = now.format("YYYY-MM-DD");
  const tsMinute = now.second(0).millisecond(0).valueOf();

  const quotes = await getQuotes(SYMBOLS as unknown as string[]);
  const db = firestoreAdmin();

  const batch = db.batch();

  const dateRef = db.doc(`indexSeries/${dateKey}`);
  batch.set(
    dateRef,
    {
      date: dateKey,
      tz: TZ,
      resolution: "1m",
      createdAt: new Date(),
      lastUpdated: new Date(),
    },
    { merge: true }
  );

  for (const q of quotes) {
    const ref = db.doc(`indexSeries/${dateKey}/symbols/${q.symbol}`);
    const snap = await ref.get();

    const data = snap.exists
      ? snap.data()!
      : {
          date: dateKey, // keep this if you want
          tz: TZ,
          resolution: "1m",
          series: [] as Array<{ t: number; p: number }>,
        };

    const series = (data.series ?? []) as Array<{ t: number; p: number }>;
    const last = series[series.length - 1];

    if (!last || last.t !== tsMinute) {
      series.push({ t: tsMinute, p: round2(q.last) });
    } else {
      last.p = round2(q.last);
    }

    batch.set(ref, { ...data, series, lastUpdated: new Date() }, { merge: true });
  }

  await batch.commit();

  return {
    skipped: false,
    wroteAt: tsMinute,
    date: dateKey,
    symbols: quotes.map((q) => q.symbol),
  };
}
