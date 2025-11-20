"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";

type SentimentPayload = {
  label: "Bullish" | "Neutral" | "Bearish" | null;
  mspr: number | null;
};

type InsiderSummaryRow = {
  name: string;
  netShares: number;
  totalBuys: number;
  totalSells: number;
  lastTradeDate?: string | null;
  lastTradeCode?: string | null;
};

type RecentTx = {
  name: string;
  change: number;
  transactionCode: string;
  transactionDate: string;
  transactionPrice: number | null;
};

type InsiderAiSummaryRequest = {
  symbol: string;
  sentiment: string | null;
  summaryRows: InsiderSummaryRow[];
  recentTransactions: RecentTx[];
};

type InsiderAiSummaryResponse = {
  summary: string;
};

async function fetchInsiderAiSummary(
  payload: InsiderAiSummaryRequest
): Promise<InsiderAiSummaryResponse> {
  const res = await fetch("/api/insiders/summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[INSIDERS_AI_SUMMARY_API_ERROR]", res.status, text);
    throw new Error("Failed to load AI insider summary");
  }

  return (await res.json()) as InsiderAiSummaryResponse;
}

export function useInsiderAiSummary<TData = InsiderAiSummaryResponse, TError = Error>(
  payload: InsiderAiSummaryRequest | null,
  options?: Omit<UseQueryOptions<InsiderAiSummaryResponse, TError, TData>, "queryKey" | "queryFn">
) {
  return useQuery<InsiderAiSummaryResponse, TError, TData>({
    queryKey: [
      "insiders-ai-summary",
      payload?.symbol ?? null,
      payload?.sentiment ?? null,
      // rough key on the first few insiders so it changes when composition changes
      payload?.summaryRows
        .slice(0, 3)
        .map((r) => r.name)
        .join("|") ?? null,
    ],
    queryFn: () => {
      if (!payload) throw new Error("Missing payload");
      return fetchInsiderAiSummary(payload);
    },
    enabled: Boolean(payload && payload.symbol),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
}
