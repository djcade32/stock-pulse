"use client";

import { auth } from "@/firebase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Stock = { symbol: string; description: string };

export function useAddToWatchlistAndAnalyze() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (stocks: Stock[]) => {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      const idToken = await user.getIdToken();

      const res = await fetch("/api/watchlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ stocks }),
      });

      if (!res.ok) {
        let msg = "Add failed";
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json() as Promise<{
        ok: true;
        analyzed: Array<{ symbol: string; eventId?: string; deduped?: boolean; error?: string }>;
        partial?: boolean;
      }>;
    },
    onSuccess: () => {
      // refresh feeds that depend on analyses
      qc.invalidateQueries({ queryKey: ["reports-feed-for-user"] });
      qc.invalidateQueries({ queryKey: ["reports-feed"] });
    },
  });
}
