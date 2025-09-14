"use client";

import QuickChart from "@/components/QuickChart";
import React, { useEffect } from "react";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useQuoteStreamPatcher } from "@/lib/client/hooks/useQuoteStreamPatcher";
import useQuickChartStore from "@/stores/quick-chart-store";
import { useQuery } from "@tanstack/react-query";
import { useUid } from "@/hooks/useUid";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";

const QuickChartsSection = () => {
  const { uid, loading } = useUid();
  const { quickChartList, setQuickChartList } = useQuickChartStore();
  const { isPending } = useQuery({
    queryKey: ["quickChartList", uid], // include uid in key so it refetches per user
    queryFn: async () => {
      const quickChartDoc = doc(db, `quickCharts/${uid}`);
      const fetchedDoc = await getDoc(quickChartDoc);
      setQuickChartList(fetchedDoc.exists() ? fetchedDoc.data().symbols : []);
      return true;
    },
    enabled: !!uid && !loading, // prevent running before uid is ready
  });

  const { quotesBySymbol, isLoading, errorsBySymbol } = useBatchQuotes(
    quickChartList.length ? quickChartList : ["AAPL", "GOOGL", "SPY"],
    { enabled: true }
  );
  useQuoteStreamPatcher(quickChartList.length ? quickChartList : ["AAPL", "GOOGL", "SPY"]);

  if (isLoading || loading || isPending)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {["AAPL", "GOOGL", "SPY"].map((symbol) => (
          <div key={symbol} className="card h-[100px] animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {quickChartList.slice(0, 3).map((symbol) => {
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
        return <QuickChart key={symbol} stock={stock} />;
      })}
    </div>
  );
};

export default QuickChartsSection;
