import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

export function firestoreAdmin() {
  if (!app) {
    // Prefer a single JSON env var; fall back to individual vars if needed.
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

    const creds = JSON.parse(raw);
    app = admin.initializeApp({
      credential: admin.credential.cert(creds),
    });
  }
  return admin.firestore();
}
