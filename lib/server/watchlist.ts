import { db } from "@/firebase/admin";
import { WatchlistStock } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Read tickers (symbols) from watchlists/<userId>.stocks
 */
export async function getUserWatchlistTickers(userId: string): Promise<string[]> {
  const ref = db.collection("watchlists").doc(userId);
  const snap = await ref.get();
  if (!snap.exists) return [];
  const data = snap.data() as { stocks?: WatchlistStock[] };
  const arr = Array.isArray(data?.stocks) ? data.stocks : [];
  return [...new Set(arr.map((s) => (s.symbol || "").toUpperCase()).filter(Boolean))];
}

/**
 * Add or update a stock in the array.
 */
export async function addWatchlistItem(userId: string, stock: WatchlistStock) {
  const symbol = (stock.symbol || "").toUpperCase();
  const canonical: WatchlistStock = {
    description: stock.description || symbol,
    symbol,
    type: stock.type || "N/A",
  };

  const ref = db.collection("watchlists").doc(userId);
  const snap = await ref.get();

  if (!snap.exists) {
    await ref.set({ stocks: [canonical] }, { merge: true });
    return;
  }

  const data = snap.data() as { stocks?: WatchlistStock[] };
  const current = Array.isArray(data?.stocks) ? data.stocks : [];
  const existing = current.find((s) => (s.symbol || "").toUpperCase() === symbol);

  if (existing) {
    if (existing.description === canonical.description) {
      return; // already exists
    }
    // Replace: remove old object, add new one
    await ref.update({ stocks: FieldValue.arrayRemove(existing) });
    await ref.update({ stocks: FieldValue.arrayUnion(canonical) });
  } else {
    await ref.update({ stocks: FieldValue.arrayUnion(canonical) });
  }
}

/**
 * Remove a stock by symbol.
 */
export async function removeWatchlistItem(userId: string, symbolInput: string) {
  const symbol = (symbolInput || "").toUpperCase();
  const ref = db.collection("watchlists").doc(userId);
  const snap = await ref.get();
  if (!snap.exists) return;

  const data = snap.data() as { stocks?: WatchlistStock[] };
  const current = Array.isArray(data?.stocks) ? data.stocks : [];
  const toRemove = current.filter((s) => (s.symbol || "").toUpperCase() === symbol);

  for (const item of toRemove) {
    await ref.update({ stocks: FieldValue.arrayRemove(item) });
  }
}
