import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "stockpulse-ce1db.firebaseapp.com",
  projectId: "stockpulse-ce1db",
  storageBucket: "stockpulse-ce1db.firebasestorage.app",
  messagingSenderId: "830880698904",
  appId: "1:830880698904:web:73006d43f1bd0fd53ca96d",
  measurementId: "G-K72F44DGY4",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
