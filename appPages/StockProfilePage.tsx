"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StockSentimentSection from "@/sections/stockProfile/StockSentimentSection";
import StockProfileHeader from "@/sections/stockProfile/StockProfileHeader";
import StockKeyFinancialMetricsSection from "@/sections/stockProfile/StockKeyFinancialMetricsSection";
import StockNextEarningsSection from "@/sections/stockProfile/StockNextEarningsSection";
import StockAnalystRatingsSection from "@/sections/stockProfile/StockAnalystRatingsSection";
import StockNewsSection from "@/sections/stockProfile/StockNewsSection";
import { track } from "@/lib/analytics";
import { StockInsiderActivitySection } from "@/sections/stockProfile/StockInsiderActivitySection";

// prevent build-time prerender so hooks run in a client context
export const dynamic = "force-dynamic";

const StockProfilePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const symbol = useMemo(() => {
    const raw = searchParams?.get("symbol") || "";
    return raw.trim().toUpperCase();
  }, [searchParams]);

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Track page view
  useEffect(() => {
    if (!symbol) return;
    track("viewed_stock_page", { symbol });
  }, [symbol]);

  useEffect(() => {
    if (!symbol) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [symbol, router]);

  if (!symbol || isRedirecting) return null;

  const dateSixMonthsAgo = new Date();
  dateSixMonthsAgo.setMonth(dateSixMonthsAgo.getMonth() - 6);
  const fromDate = dateSixMonthsAgo.toISOString().slice(0, 10);
  const toDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="page">
      <StockProfileHeader symbol={symbol} />
      <StockSentimentSection symbol={symbol} />
      <StockKeyFinancialMetricsSection symbol={symbol} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StockNextEarningsSection symbol={symbol} />
        <StockAnalystRatingsSection symbol={symbol} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockNewsSection symbol={symbol} />
        <StockInsiderActivitySection symbol={symbol} from={fromDate} to={toDate} />
      </div>
    </div>
  );
};

export default StockProfilePage;
