// /app/api/auth/sign-out/route.ts
import "server-only";
import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/actions/auth.server.action";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";

export async function POST() {
  try {
    console.log("Signing out...");
    await signOut(auth);
    await deleteSessionCookie();
    console.log("Sign-out successful");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[auth.sign-out] error:", err);
    // Clear cookie even on error to avoid a stuck session
    await deleteSessionCookie();
    return NextResponse.json({ success: false, message: "Failed to sign out" }, { status: 500 });
  }
}
