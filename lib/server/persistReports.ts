import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore"; // <-- Admin SDK

export async function upsertFilingEvent(eventId: string, payload: any) {
  const ref = db.doc(`filingEvents/${eventId}`);
  await ref.set(
    { ...payload, app: "stock-pulse", updatedAt: FieldValue.serverTimestamp() }, // <-- here
    { merge: true }
  );
}

export async function saveFilingAnalysis(eventId: string, payload: any) {
  const ref = db.doc(`filingAnalyses/${eventId}`);
  await ref.set(
    { ...payload, app: "stock-pulse", createdAt: FieldValue.serverTimestamp() }, // <-- here
    { merge: true }
  );
}
