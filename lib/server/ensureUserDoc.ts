import "server-only";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { WatchlistStock } from "@/types";

const DEFAULT_WATCHLIST: WatchlistStock[] = [
  { symbol: "AAPL", description: "Apple Inc.", type: "Technology" },
  { symbol: "MSFT", description: "Microsoft Corporation", type: "Technology" },
  { symbol: "GOOGL", description: "Alphabet Inc.", type: "Communication Services" },
  { symbol: "AMZN", description: "Amazon.com, Inc.", type: "Consumer Discretionary" },
  { symbol: "TSLA", description: "Tesla, Inc.", type: "Consumer Discretionary" },
  { symbol: "NVDA", description: "NVIDIA Corporation", type: "Technology" },
];

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
  const watchlistRef = db.collection("watchlists").doc(uid);

  // read once; keep the function idempotent and fast
  const snap = await ref.get();
  const watchlistSnap = await watchlistRef.get();
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

    // Create default watchlist for new user
    if (!watchlistSnap.exists) {
      await watchlistRef.set({
        stocks: DEFAULT_WATCHLIST.map((stock) => ({ ...stock, createdAt: Date.now() })),
      });
    }
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
