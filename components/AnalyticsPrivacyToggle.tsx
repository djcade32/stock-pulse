// components/AnalyticsPrivacyToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent, AnalyticsConsent } from "@/lib/consent";
import { optInAnalytics, optOutAnalytics, initAnalytics } from "@/lib/analytics";

export default function AnalyticsPrivacyToggle() {
  const [state, setState] = useState<AnalyticsConsent>("unknown");

  useEffect(() => {
    setState(getAnalyticsConsent());
  }, []);

  useEffect(() => {
    if (state === "accepted") {
      optInAnalytics();
      initAnalytics();
    } else if (state === "rejected") {
      optOutAnalytics();
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-neutral-700 p-4">
      <h3 className="mb-2 text-base font-semibold">Analytics</h3>
      <p className="mb-3 text-sm text-neutral-300">
        Control Mixpanel analytics. Turning this off opts you out of analytics and “sale/share” for
        CPRA purposes.
      </p>
      <div className="flex gap-2">
        <button
          className={`rounded-lg px-3 py-2 ${
            state === "accepted" ? "bg-[#2187fe] text-white" : "border border-neutral-600"
          }`}
          onClick={() => {
            setAnalyticsConsent("accepted");
            setState("accepted");
          }}
        >
          Enable analytics
        </button>
        <button
          className={`rounded-lg px-3 py-2 ${
            state === "rejected" ? "bg-[#2187fe] text-white" : "border border-neutral-600"
          }`}
          onClick={() => {
            setAnalyticsConsent("rejected");
            setState("rejected");
          }}
        >
          Disable analytics
        </button>
      </div>
    </div>
  );
}
