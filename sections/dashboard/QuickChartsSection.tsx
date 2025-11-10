"use client";

import QuickChart from "@/components/QuickChart";
import React from "react";
import { useUid } from "@/hooks/useUid";
import { useIndexSeries } from "@/lib/client/hooks/useIndexSeries"; // <- new hook

const INDEXES = ["SPY", "QQQ", "IWM"];

const QuickChartsSection = () => {
  const { loading: authLoading } = useUid();
  const { seriesBySymbol, latestBySymbol, loading, errorsBySymbol, previousSession, displayDate } =
    useIndexSeries(INDEXES);

  if (loading || authLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {INDEXES.map((symbol) => (
          <div key={symbol} className="card h-[100px] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {/* {previousSession && displayDate && (
        <p className="text-(--secondary-text-color) text-xs mb-2">
          Showing previous session: {displayDate}
        </p>
      )} */}
      {INDEXES.map((symbol) => {
        const err = errorsBySymbol[symbol];
        const ser = seriesBySymbol[symbol] ?? [];
        const latest = latestBySymbol[symbol];

        if (err) console.error(`Error for ${symbol}: ${err}`);
        if (!ser.length) return null;

        const stock = {
          ticker: symbol,
          price: Number((latest?.price ?? 0).toFixed(2)) || 0,
          change: Number((latest?.changePct ?? 0).toFixed(2)) || 0, // intraday % from first point
        };

        // ⬇️ Add `series` prop to QuickChart (optional but recommended for consistent sparkline)
        return <QuickChart key={symbol} stock={stock} series={ser} deletable={false} />;
      })}
    </div>
  );
};

export default QuickChartsSection;
