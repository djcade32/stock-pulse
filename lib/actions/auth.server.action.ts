"use server";

import { db, auth } from "@/firebase/admin";
import { SignInParams, SignInResult, SignUpParams, User } from "@/types";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;
const ONE_WEEK_SEC = 60 * 60 * 24 * 7;
const ONE_WEEK_MS = ONE_WEEK_SEC * 1000;

export async function signUp(params: SignUpParams) {
  const { name, uid, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please Sign In.",
      };
    }

    await db.collection("users").doc(uid).set({ _id: uid, name, email });
    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error signing up:", error);

    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    return {
      success: false,
      message: "Error signing up",
    };
  }
}

export async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, idToken } = params;
  try {
    // Verify first so we can return precise reasons
    await auth.verifyIdToken(idToken);

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK_MS,
    });

    const jar = await cookies(); // no await
    jar.set("session", sessionCookie, {
      maxAge: ONE_WEEK_SEC, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (e: any) {
    // Common Admin codes: 'auth/id-token-expired', 'auth/argument-error', 'auth/invalid-id-token'
    const code = e?.code as string | undefined;

    if (code === "auth/id-token-expired") {
      return {
        success: false,
        code: "ID_TOKEN_EXPIRED",
        message: "Session expired. Please try again.",
      };
    }
    if (code === "auth/argument-error" || code === "auth/invalid-id-token") {
      return {
        success: false,
        code: "INVALID_ID_TOKEN",
        message: "Invalid sign-in token. Please try again.",
      };
    }

    console.error("Error creating session cookie:", e);
    return { success: false, message: "Error signing in" };
  }
}

export async function setSessionCookie(idToken: string) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: ONE_WEEK * 1000 });
    cookieStore.set("session", sessionCookie, {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return sessionCookie;
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw new Error("Error creating session cookie");
  }
}

export async function getCurrentUser(): Promise<{ user: User | null; invalidSession: boolean }> {
  const jar = await cookies(); // ← no await
  const sessionCookie = jar.get("session")?.value;
  if (!sessionCookie) return { user: null, invalidSession: false };

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true); // checks expiry & revocation
    const snap = await db.collection("users").doc(decoded.uid).get();
    if (!snap.exists) return { user: null, invalidSession: true };
    return { user: { id: decoded.uid, ...(snap.data() as any) }, invalidSession: false };
  } catch (e: any) {
    // DO NOT jar.delete here; layouts can't modify cookies
    // e.code can be 'auth/session-cookie-expired', 'auth/session-cookie-revoked', etc.
    return { user: null, invalidSession: true };
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const { user } = await getCurrentUser();
  return !!user;
}
