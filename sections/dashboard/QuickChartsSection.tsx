"use client";

import QuickChart from "@/components/QuickChart";
import React from "react";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";

const DUMMY_STOCK_DATA = ["AAPL", "GOOGL", "MSFT"];
// const DUMMY_STOCK_DATA = [
//   { ticker: "S&P 500", price: 4587.64, change: 1.2 },
//   { ticker: "NASDAQ", price: 14567.89, change: -0.5 },
//   { ticker: "VIX", price: 18.27, change: 3.3 },
// ];

const QuickChartsSection = () => {
  const { quotesBySymbol, isLoading, isFetching, errorsBySymbol } = useBatchQuotes(
    DUMMY_STOCK_DATA,
    { enabled: true }
  );

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {DUMMY_STOCK_DATA.map((symbol) => (
          <div key={symbol} className="card h-[100px] animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {DUMMY_STOCK_DATA.map((symbol) => {
        const quote = quotesBySymbol[symbol];
        const error = errorsBySymbol[symbol];
        if (error) console.error(`Error loading quote for ${symbol}: ${error}`);
        if (!quote) console.warn(`No quote data for ${symbol}`);
        if (!quote || error) return null;

        const stock = {
          ticker: symbol,
          price: quote.c,
          change: Number(quote.dp.toFixed(2)),
        };
        return <QuickChart key={symbol} stock={stock} />;
      })}
    </div>
  );
};

export default QuickChartsSection;
