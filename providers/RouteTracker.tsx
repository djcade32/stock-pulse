// components/RouteTracker.tsx
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";
import { getAnalyticsConsent } from "@/lib/consent";

export default function RouteTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname + (search?.toString() ? `?${search.toString()}` : "");
    if (prevPathRef.current === path) return;
    prevPathRef.current = path;
    if (getAnalyticsConsent() !== "accepted") return;
    // track("viewed_route", { path }, { key: `viewed_route:${path}` });
  }, [pathname, search]);

  return null;
}
