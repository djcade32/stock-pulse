import { db } from "@/firebase/admin";
import { WhisperDoc } from "@/types";

export async function putUserWhisper(uid: string, doc: WhisperDoc) {
  const ref = db.collection("users").doc(uid).collection("marketWhisper").doc(doc.date);
  await ref.set(doc, { merge: true });
  return ref.id;
}

export async function getUserWhisper(uid: string, date: string) {
  const ref = db.collection("users").doc(uid).collection("marketWhisper").doc(date);
  const snap = await ref.get();
  return snap.exists ? (snap.data() as WhisperDoc) : null;
}
