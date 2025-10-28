"use client";

import { useMarketStatus } from "@/lib/client/hooks/useMarketStatus";
import React from "react";

const MarketOpenOrClosed = () => {
  const { data, isLoading, isError } = useMarketStatus();

  const className = "text-sm text-(--secondary-text-color) mb-2 justify-end flex";
  if (isLoading) return <span className={className}>Checking market…</span>;
  if (isError || !data) return <span className={className}>Market status unavailable</span>;

  // Get time for market using properties t, and timezone
  const marketTime = data.serverTime
    ? new Date(data.serverTime).toLocaleTimeString("en-US", {
        timeZone: data.timezone ?? "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <p className={className}>
      Market is
      <span className="font-medium">
        {data.isOpen ? (
          <span className="text-(--success-color) ml-1">Open</span>
        ) : (
          <span className="text-(--danger-color) ml-1">Closed</span>
        )}
      </span>
      {marketTime && <span className="ml-1">{`• ${marketTime} EDT`}</span>}
    </p>
  );
};

export default MarketOpenOrClosed;
