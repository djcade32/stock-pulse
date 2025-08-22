import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "stockpulse-c3f61.firebaseapp.com",
  projectId: "stockpulse-c3f61",
  storageBucket: "stockpulse-c3f61.firebasestorage.app",
  messagingSenderId: "424542187155",
  appId: "1:424542187155:web:98de5259a7ee1ea360a766",
  measurementId: "G-2785KB9MMS",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
