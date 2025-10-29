import { db } from "@/firebase/admin"; // Admin SDK
import { MacroEvent } from "@/types";

export async function upsertEvents(events: MacroEvent[]) {
  const batch = db.batch();
  for (const ev of events) {
    const ref = db.collection("macro_events").doc(ev.id);
    batch.set(ref, ev, { merge: true });
  }
  await batch.commit();
}

export async function upsertChangedOnly(events: MacroEvent[]) {
  const batch = db.batch();
  for (const ev of events) {
    const ref = db.collection("macro_events").doc(ev.id);
    const snap = await ref.get();
    const prev = snap.exists ? (snap.data() as MacroEvent) : null;
    if (!prev || prev.hash !== ev.hash) {
      batch.set(ref, ev, { merge: true });
    }
  }
  await batch.commit();
}

// Small helper: commit batches safely (Firestore limit ~500 ops)
async function commitInChunks(
  writes: ((batch: FirebaseFirestore.WriteBatch) => void)[],
  chunk = 400
) {
  for (let i = 0; i < writes.length; i += chunk) {
    const batch = db.batch();
    for (const apply of writes.slice(i, i + chunk)) apply.call(null, batch);
    await batch.commit();
  }
}

export async function replaceMonthEvents(
  events: MacroEvent[],
  windowStartISO: string, // 'YYYY-MM-DD'
  windowEndISO: string // 'YYYY-MM-DD'
) {
  const col = db.collection("macro_events");

  // 1) Gather existing docs in the window.
  //   a) Normal single-day events: date in [start, end]
  const snapDate = await col
    .where("date", ">=", windowStartISO)
    .where("date", "<=", windowEndISO)
    .get();

  //   b) Spans that might overlap the window:
  //      We query span.start <= windowEnd, then filter client-side for span.end >= windowStart
  const snapSpanStart = await col.where("span.start", "<=", windowEndISO).get();

  const existingIds = new Set<string>();
  snapDate.docs.forEach((d) => existingIds.add(d.id));
  snapSpanStart.docs.forEach((d) => {
    const data = d.data() as MacroEvent;
    if (data.span?.end && data.span.end >= windowStartISO) {
      existingIds.add(d.id);
    }
  });

  // 2) Prepare writes:
  const newIds = new Set(events.map((e) => e.id));

  const writes: ((batch: FirebaseFirestore.WriteBatch) => void)[] = [];

  // Upsert (merge) all new/updated docs for this window
  for (const ev of events) {
    const ref = col.doc(ev.id);
    writes.push((batch) => batch.set(ref, ev, { merge: true }));
    existingIds.delete(ev.id); // remove from "to-delete" set
  }

  // Delete anything that existed in the window but not in the latest fetch
  for (const leftoverId of existingIds) {
    const ref = col.doc(leftoverId);
    writes.push((batch) => batch.delete(ref));
  }

  // 3) Commit
  await commitInChunks(writes);

  return {
    upserted: events.length,
    deleted: Array.from(existingIds).length,
  };
}
