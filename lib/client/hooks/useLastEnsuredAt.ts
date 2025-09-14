"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/client";
import { doc, onSnapshot } from "firebase/firestore";

export function useLastEnsuredAt() {
  const [ts, setTs] = useState<Date | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(db, "watchlists", uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      const data = snap.data() as any;
      const t = data?.lastEnsuredAt;
      // Firestore client returns a Timestamp object; convert to Date
      setTs(t?.toDate?.() ?? null);
    });

    return () => unsubscribe();
  }, [auth.currentUser?.uid]);

  return ts;
}
