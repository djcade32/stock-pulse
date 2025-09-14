"use client";

import { useEffect, useRef } from "react";
import { auth } from "@/firebase/client";

type Options = {
  // avoid spamming: only run at most once every X ms per tab
  throttleMs?: number; // default 5 minutes
};

export function useEnsureLatestOnOpen({ throttleMs = 5 * 60_000 }: Options = {}) {
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const now = Date.now();
      if (now - lastRunRef.current < throttleMs) return;
      lastRunRef.current = now;

      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      await fetch("/api/reports/ensure-latest-for-user", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {}); // best-effort; UI will still show cached feed
    }

    // run once on mount
    run();

    // also run when tab regains focus
    const onFocus = () => run();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [throttleMs]);
}
