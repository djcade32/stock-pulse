"use client";
import { auth } from "@/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { deleteSessionCookie } from "./auth.server.action";

export async function signOut() {
  console.log("Signing out...");
  await firebaseSignOut(auth);
  await deleteSessionCookie();
  console.log("Sign-out successful");
}
