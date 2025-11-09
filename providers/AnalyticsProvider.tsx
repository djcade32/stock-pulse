"use client";
import { useEffect, useRef } from "react";
import { initAnalytics, setSuperProps, track } from "@/lib/analytics";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsProvider() {
  const hasBooted = useRef(false);
  const pathname = usePathname();
  const search = useSearchParams();

  // Boot once on first client render
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;
    initAnalytics();
    setSuperProps({
      app: "StockWisp",
      env: process.env.NODE_ENV,
      device: /Mobi/i.test(navigator.userAgent) ? "mobile" : "desktop",
      referrer: document.referrer || "direct",
      plan: "free", // replaced dynamically if user becomes premium
    });
    // key-based de-dupe ensures this won't double-fire on hydration quirks
    track("app_opened", undefined, { key: "app_opened_once_per_session" });
  }, []);

  // Route change tracking (only fire when actual path changes)
  const prevPathRef = useRef<string | null>(null);
  useEffect(() => {
    const path = pathname + (search?.toString() ? `?${search.toString()}` : "");
    if (prevPathRef.current === path) return;
    prevPathRef.current = path;

    // Use a key scoped to the path so accidental double renders don't duplicate
    // track("viewed_route", { path }, { key: `viewed_route:${path}` });
  }, [pathname, search]);

  return null;
}
