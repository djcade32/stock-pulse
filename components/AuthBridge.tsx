"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import { identify, resetAnalytics, setUserProps } from "@/lib/analytics";
import { useUid } from "@/hooks/useUid";

export default function AuthBridge() {
  const { uid } = useUid();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        identify(user.uid, {
          $email: user.email ?? undefined,
          join_date: user.metadata?.creationTime,
        });
        setUserProps({
          last_active_at: new Date().toISOString(),
        });
      } else {
        resetAnalytics();
      }
    });
    return () => unsub();
  }, [uid]);
  return null;
}
