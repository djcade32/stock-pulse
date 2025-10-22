"use client";

import { auth, db } from "@/firebase/client";
import {
  EmailAuthProvider,
  signOut as firebaseSignOut,
  reauthenticateWithCredential,
} from "firebase/auth";
import { deleteSessionCookie } from "./auth.server.action";
import { PromiseResolveType } from "@/types";
import { deleteDoc, doc } from "firebase/firestore";

export async function signOut() {
  console.log("Signing out...");
  await firebaseSignOut(auth);
  await deleteSessionCookie();
  console.log("Sign-out successful");
}

// Remove user document from firebase db
export const removeUserFromDb = async (uid: string) => {
  if (!db) {
    throw new Error("Firebase DB is not initialized");
  }
  try {
    const usersDocRef = doc(db, "users", uid);
    await deleteDoc(usersDocRef);
    const watchlistsDocRef = doc(db, "watchlists", uid);
    await deleteDoc(watchlistsDocRef);
    const quickChartsDocRef = doc(db, "quickCharts", uid);
    await deleteDoc(quickChartsDocRef);
    console.log(`User document with uid ${uid} removed from Firestore`);
  } catch (error) {
    console.error(`Error removing user document: ${error}`);
    throw error;
  }
};

export async function deleteAccount() {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  if (!auth.currentUser) {
    throw new Error("No user is logged in");
  }
  try {
    await removeUserFromDb(auth.currentUser.uid);
    await auth.currentUser.delete();
    await deleteSessionCookie();
  } catch (error) {
    console.error(`Error deleting user account: ${error}`);
    throw error;
  }
}

export const reauthenticateUser = async (
  email: string,
  password: string
): Promise<PromiseResolveType> => {
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }
  if (!auth.currentUser) {
    throw new Error("No user is logged in");
  }
  try {
    const credential = EmailAuthProvider.credential(email, password);
    const userCred = await reauthenticateWithCredential(auth.currentUser, credential);
    if (userCred) {
      return { success: true };
    }
  } catch (error: any) {
    console.error("Reauthentication error:", error);
    if (error.message.includes("auth/invalid-credential")) {
      return { success: false, message: "Invalid password" };
    }
    throw error;
  }
  return { success: false, message: "Reauthentication failed" };
};
