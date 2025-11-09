// components/ConsentBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "@/lib/consent";
import Button from "./general/Button";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getAnalyticsConsent() === "unknown") setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto mb-4 max-w-3xl rounded-xl border border-(--gray-accent-color) bg-(--background)/95 p-4 text-sm text-neutral-100 shadow-lg backdrop-blur">
        <p className="mb-3">
          We use cookies and <strong>Mixpanel</strong> to analyze usage and improve StockWisp. You
          can accept or reject analytics. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:opacity-80">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setAnalyticsConsent("accepted");
              setVisible(false);
            }}
          >
            Accept analytics
          </Button>
          <Button
            onClick={() => {
              setAnalyticsConsent("rejected");
              setVisible(false);
            }}
            variant="outline"
            className="bg-(--secondary-color) border-(--gray-accent-color) hover:bg-(--secondary-color)/90"
          >
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}
