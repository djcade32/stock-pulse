import "server-only";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

type DecodedToken = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  // firebase-specific claims are nested here when present
  firebase?: { sign_in_provider?: string };
};

/**
 * Ensure a user document exists and is updated with fresh profile info.
 * - Creates doc on first sign-in.
 * - On subsequent sign-ins, only updates non-destructive fields (lastLoginAt, provider, photo/name/email if missing).
 */
export async function ensureUserDoc(uid: string, decoded: DecodedToken) {
  const ref = db.collection("users").doc(uid);

  // read once; keep the function idempotent and fast
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();

  // Normalize provider
  const provider = decoded.firebase?.sign_in_provider ?? "custom";

  // Minimal profile shape you can expand later
  const baseProfile = {
    uid,
    email: decoded.email ?? null,
    displayName: decoded.name ?? null,
    photoURL: decoded.picture ?? null,
    provider,
  };

  if (!snap.exists) {
    // first time: create full doc
    await ref.set({
      ...baseProfile,
      createdAt: now,
      lastLoginAt: now,
      // room for app-specific fields:
      roles: ["user"],
      settings: {
        theme: "system",
        watchlist: [],
      },
    });
    return { created: true };
  }

  // existing: update only “fresh” bits (don’t clobber user settings)
  const updates: Record<string, unknown> = {
    lastLoginAt: now,
    provider,
  };

  // only set profile fields if they’re missing or null in the doc
  const data = snap.data() ?? {};
  if (!data.email && decoded.email) updates.email = decoded.email;
  if (!data.displayName && decoded.name) updates.displayName = decoded.name;
  if (!data.photoURL && decoded.picture) updates.photoURL = decoded.picture;

  if (Object.keys(updates).length > 0) {
    await ref.update(updates);
  }

  return { created: false };
}
