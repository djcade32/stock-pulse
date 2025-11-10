// server/lib/firebaseAdmin.ts
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let dbSingleton: ReturnType<typeof getFirestore> | null = null;

export function firestoreAdmin() {
  if (dbSingleton) return dbSingleton;

  // Parse once; keep tiny surface area to avoid bundler duplications.
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON missing");

  const creds = JSON.parse(raw);

  // Only initialize if no apps exist in this process
  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(creds),
      });

  dbSingleton = getFirestore(app);
  return dbSingleton;
}
