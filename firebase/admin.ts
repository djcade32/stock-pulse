// import { cert, getApps, initializeApp } from "firebase-admin/app";
// import { getAuth } from "firebase-admin/auth";
// import { getFirestore } from "firebase-admin/firestore";

// const initFirebaseAdmin = () => {
//   const apps = getApps();
//   if (!apps.length) {
//     initializeApp({
//       credential: cert({
//         projectId: process.env.FIREBASE_PROJECT_ID,
//         clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
//         privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//       }),
//     });
//   }
//   return {
//     auth: getAuth(),
//     db: getFirestore(),
//   };
// };

// export const { auth, db } = initFirebaseAdmin();

// /firebase/admin.ts
import "dotenv/config"; // ensure env is loaded when run via scripts
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function buildCredential() {
  // A) Full JSON via env var (strongly typed)
  const jsonRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (jsonRaw) {
    const svc = JSON.parse(jsonRaw);
    return cert({
      projectId: svc.project_id,
      clientEmail: svc.client_email,
      privateKey: svc.private_key,
    });
  }

  // B) Three separate vars (your current approach)
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && privateKey) {
    // Fix escaped newlines if needed
    if (privateKey.includes("\\n")) privateKey = privateKey.replace(/\\n/g, "\n");
    return cert({ projectId, clientEmail, privateKey });
  }

  // C) Fall back to ADC (GOOGLE_APPLICATION_CREDENTIALS path)
  return applicationDefault();
}

const initFirebaseAdmin = () => {
  if (!getApps().length) {
    initializeApp({
      credential: buildCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID || undefined, // optional
    });
  }
  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

export const { auth, db } = initFirebaseAdmin();
