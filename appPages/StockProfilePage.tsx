"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StockSentimentSection from "@/sections/stockProfile/StockSentimentSection";
import StockProfileHeader from "@/sections/stockProfile/StockProfileHeader";
import StockKeyFinancialMetricsSection from "@/sections/stockProfile/StockKeyFinancialMetricsSection";
import StockNextEarningsSection from "@/sections/stockProfile/StockNextEarningsSection";
import StockAnalystRatingsSection from "@/sections/stockProfile/StockAnalystRatingsSection";
import StockNewsSection from "@/sections/stockProfile/StockNewsSection";

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

  useEffect(() => {
    if (!symbol) {
      setIsRedirecting(true);
      router.replace("/dashboard");
    }
  }, [symbol, router]);

  if (!symbol || isRedirecting) return null;

  return (
    <div className="page">
      <StockProfileHeader symbol={symbol} />
      <StockSentimentSection symbol={symbol} />
      <StockKeyFinancialMetricsSection symbol={symbol} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StockNextEarningsSection symbol={symbol} />
        <StockAnalystRatingsSection symbol={symbol} />
      </div>
      <StockNewsSection symbol={symbol} />
    </div>
  );
};

export default StockProfilePage;
