"use client";

import QuickChart from "@/components/QuickChart";
import React from "react";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useQuoteStreamPatcher } from "@/lib/client/hooks/useQuoteStreamPatcher";
import { useUid } from "@/hooks/useUid";

const INDEXES = ["SPY", "QQQ", "IWM"];

const QuickChartsSection = () => {
  const { loading } = useUid();

  const { quotesBySymbol, isLoading, errorsBySymbol } = useBatchQuotes(INDEXES, {
    enabled: true,
    marketRefetchMs: 30_000,
  });
  useQuoteStreamPatcher(INDEXES);

  if (isLoading || loading) {
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
      {INDEXES.map((symbol) => {
        const quote = quotesBySymbol[symbol];
        const error = errorsBySymbol[symbol];
        if (error) console.error(`Error loading quote for ${symbol}: ${error}`);
        if (!quote) console.warn(`No quote data for ${symbol}`);
        if (!quote || error) return null;

        const stock = {
          ticker: symbol,
          price: Number(quote.c.toFixed(2)) || 0,
          change: Number(quote.dp.toFixed(2)) || 0, // use change percentage if available
        };
        return <QuickChart key={symbol} stock={stock} deletable={false} />;
      })}
    </div>
  );
};

export default QuickChartsSection;
