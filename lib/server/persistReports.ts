import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore"; // <-- Admin SDK

export async function upsertFilingEvent(eventId: string, payload: any) {
  const ref = db.doc(`filingEvents/${eventId}`);
  await ref.set(
    { ...payload, app: "stock-wisp", updatedAt: FieldValue.serverTimestamp() }, // <-- here
    { merge: true }
  );
}

export async function saveFilingAnalysis(eventId: string, payload: any) {
  const ref = db.doc(`filingAnalyses/${eventId}`);
  await ref.set(
    { ...payload, app: "stock-wisp", createdAt: FieldValue.serverTimestamp() }, // <-- here
    { merge: true }
  );
}

// Added latest earnings date to watchlist stocks
export async function persistLatestEarningsDate(ticker: string, earningsDate: string) {
  const watchlistsRef = db.collection("companies").where("symbol", "==", ticker);
  const snapshot = await watchlistsRef.get();
  if (snapshot.empty) {
    db.collection("companies").doc(ticker).set(
      {
        symbol: ticker,
        latestEarningsDate: earningsDate,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return;
  }
  snapshot.forEach((doc) => {
    doc.ref.set(
      {
        latestEarningsDate: earningsDate,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}
