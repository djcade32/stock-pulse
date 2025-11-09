// components/AnalyticsBoot.tsx
"use client";

import { useEffect, useRef } from "react";
import { initAnalytics, setSuperProps, track } from "@/lib/analytics";
import { getAnalyticsConsent, onAnalyticsConsentChange } from "@/lib/consent";

export default function AnalyticsBoot() {
  const hasBooted = useRef(false);

  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    const initIfConsent = () => {
      if (getAnalyticsConsent() === "accepted") {
        initAnalytics();
        setSuperProps({
          app: "StockWisp",
          env: process.env.NODE_ENV,
          device: /Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop",
          referrer: document.referrer || "direct",
          plan: "free",
        });
        track("app_opened", undefined, { key: "app_opened_once_per_session" });
      }
    };
    initIfConsent();
    const off = onAnalyticsConsentChange(() => initIfConsent());
    return () => off();
  }, []);

  return null;
}
