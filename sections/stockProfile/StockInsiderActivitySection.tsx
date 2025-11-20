"use client";

import React, { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, Info, Loader2, Sparkles } from "lucide-react";
import { useInsiderActivity } from "@/lib/client/hooks/useInsiderActivity";
import { useInsiderAiSummary } from "@/lib/client/hooks/useInsiderAiSummary";
import type { FinnhubInsiderTransaction, InsidersApiResponse, InsiderSummaryRow } from "@/types";
import LoaderComponent from "@/components/general/LoaderComponent";
import AiTag from "@/components/AiTag";

type Props = {
  symbol: string;
  from: string;
  to: string;
  maxSummaryRows?: number;
  maxRecentRows?: number;
};

export function StockInsiderActivitySection({
  symbol,
  from,
  to,
  maxSummaryRows = 6,
  maxRecentRows = 10,
}: Props) {
  // 1) ALWAYS call hooks at the top, every render
  const { data, isLoading, isError, error } = useInsiderActivity({
    symbol,
    from,
    to,
  });

  const insidersData = data as InsidersApiResponse | undefined;

  const symbolUpper = useMemo(
    () => insidersData?.symbol?.toUpperCase?.() ?? symbol.toUpperCase(),
    [insidersData?.symbol, symbol]
  );

  const hasActivity = !!(insidersData && insidersData.count > 0);
  const sentiment = insidersData?.sentiment;

  const summaryRows: InsiderSummaryRow[] = useMemo(
    () => (insidersData?.summary ? insidersData.summary.slice(0, maxSummaryRows) : []),
    [insidersData?.summary, maxSummaryRows]
  );

  const recent: FinnhubInsiderTransaction[] = useMemo(() => {
    if (!insidersData?.data) return [];
    return [...insidersData.data]
      .sort((a, b) => (b.transactionDate > a.transactionDate ? 1 : -1))
      .slice(0, maxRecentRows);
  }, [insidersData?.data, maxRecentRows]);

  // Build AI payload (or null) – still unconditional hook usage
  const aiPayload = useMemo(
    () =>
      hasActivity && insidersData
        ? {
            symbol: symbolUpper,
            sentiment: sentiment || null,
            summaryRows: summaryRows.map((row) => ({
              name: row.name,
              netShares: row.netShares,
              totalBuys: row.totalBuys,
              totalSells: row.totalSells,
              lastTradeDate: row.lastTradeDate ?? null,
              lastTradeCode: row.lastTradeCode ?? null,
            })),
            recentTransactions: recent.map((tx) => ({
              name: tx.name,
              change: tx.change,
              transactionCode: tx.transactionCode,
              transactionDate: tx.transactionDate,
              transactionPrice: tx.transactionPrice ?? null,
            })),
          }
        : null,
    [hasActivity, insidersData, symbolUpper, sentiment, summaryRows, recent]
  );

  const { data: aiData, isLoading: aiLoading, isError: aiError } = useInsiderAiSummary(aiPayload);

  // 2) AFTER all hooks, decide what to render

  // 3) Normal render when we have data

  return (
    <LoaderComponent
      height="13rem"
      width="100%"
      loading={isLoading}
      className="bg-(--secondary-color) px-6 py-4 rounded-lg"
      rounded="lg"
      loadingClassName="bg-(--secondary-color)"
    >
      {/* if (isError || !insidersData) {
    return ( */}
      {(isError || !insidersData) && (
        <div className="w-full rounded-lg bg-(--secondary-color) p-4 text-sm">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{error instanceof Error ? error.message : "Error loading insider data"}</span>
          </div>
        </div>
      )}
      {/* ); */}
      {/* } */}
      <div>
        {/* Header */}
        <div className="mb-3 flex justify-between gap-3">
          <div>
            <div>
              <p className="text-lg md:text-xl font-bold">Insider Activity</p>
            </div>
            <div className="text-sm font-medium text-(--secondary-text-color)">
              <p>Last 6 months</p>
            </div>
          </div>

          {sentiment && (
            <AiTag
              tag={{
                sentiment:
                  sentiment === "Bullish"
                    ? "positive"
                    : sentiment === "Bearish"
                    ? "negative"
                    : "neutral",
                topic: sentiment,
              }}
            />
          )}
        </div>

        {!hasActivity ? (
          <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/60 p-4 text-slate-400">
            No insider transactions reported in this window.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* AI summary block */}
            <div className="rounded-lg bg-(--background) p-3">
              <div className="mb-1 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-(--accent-color)" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">
                  AI view on insider activity
                </span>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 text-[11px]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Analyzing insider trades…</span>
                </div>
              )}

              {aiError && !aiLoading && (
                <div className="text-[11px] text-(--gray-accent-color)">
                  Could not load AI summary. Use the tables below to review insider buys and sells.
                </div>
              )}

              {!aiLoading && !aiError && aiData?.summary && (
                <p className="text-sm leading-6">{aiData.summary}</p>
              )}

              <p className="mt-2 text-[10px] text-slate-500">
                This is an AI interpretation of recent insider trades. It is not investment advice
                and should be used together with your own research.
              </p>
            </div>

            {/* Insider summary table */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide">By insider</h3>
                <span className="text-[10px] text-slate-500">Net shares over this period</span>
              </div>

              <div className="overflow-hidden rounded-lg bg-(--background) overflow-x-scroll">
                <table className="min-w-full text-[11px] md:text-sm text-xs ">
                  <thead className="bg-(--background) text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Insider</th>
                      <th className="px-3 py-2 text-right font-medium">Net shares</th>
                      <th className="px-3 py-2 text-left font-medium">Direction</th>
                      <th className="px-3 py-2 text-left font-medium">Last trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryRows.map((row, idx) => {
                      const net = row.netShares;
                      const isBuy = net > 0;
                      const isSell = net < 0;

                      return (
                        <tr
                          key={`${row.name}-${idx}`}
                          className="border-t border-slate-800/80 hover:bg-(--secondary-color)/50"
                        >
                          <td className="px-3 py-2 align-middle">{row.name}</td>
                          <td className="px-3 py-2 text-right align-middle font-mono">
                            {net.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 align-middle">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-nowrap ${
                                isBuy
                                  ? "bg-(--success-color)/20 text-(--success-color) border border-(--success-color)/40"
                                  : isSell
                                  ? "bg-(--danger-color)/20 text-(--danger-color) border border-(--danger-color)/40"
                                  : "bg-(--gray-accent-color)/40 text-slate-300 border border-(--gray-accent-color)/40"
                              }`}
                            >
                              {isBuy && <ArrowUpRight className="h-3 w-3" />}
                              {isSell && <ArrowDownRight className="h-3 w-3" />}
                              {isBuy ? "Net buyer" : isSell ? "Net seller" : "Flat"}
                            </span>
                          </td>
                          <td className="px-3 py-2 align-middle">
                            {row.lastTradeDate ? (
                              <span className="flex flex-col">
                                <span className="font-mono text-nowrap">{row.lastTradeDate}</span>
                                {row.lastTradeCode && (
                                  <span className="text-[10px] text-slate-500">
                                    Code {row.lastTradeCode}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-500">n/a</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {summaryRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-3 text-center text-slate-400">
                          No insider summary available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent transactions table */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide">
                  Recent transactions
                </h3>
                <span className="text-[10px] text-slate-500">
                  Most recent {recent.length} filings
                </span>
              </div>

              <div className="overflow-hidden rounded-lg bg-(--background)/80 overflow-x-scroll">
                <table className="min-w-full text-[11px] md:text-sm text-xs">
                  <thead className="bg-(--background)/80 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Insider</th>
                      <th className="px-3 py-2 text-left font-medium">Code</th>
                      <th className="px-3 py-2 text-right font-medium">Shares</th>
                      <th className="px-3 py-2 text-right font-medium">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((tx) => (
                      <tr
                        key={`${tx.transactionDate}-${tx.name}-${tx.id ?? tx.filingDate}`}
                        className="border-t border-slate-800/80 hover:bg-(--secondary-color)/50"
                      >
                        <td className="px-3 py-2 align-middle font-mono text-nowrap">
                          {tx.transactionDate}
                        </td>
                        <td className="px-3 py-2 align-middle">{tx.name}</td>
                        <td className="px-3 py-2 align-middle text-slate-300">
                          {tx.transactionCode}
                        </td>
                        <td className="px-3 py-2 text-right align-middle font-mono">
                          <span
                            className={
                              tx.change > 0
                                ? "text-(--success-color)"
                                : tx.change < 0
                                ? "text-(--danger-color)"
                                : "text-slate-200"
                            }
                          >
                            {tx.change.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right align-middle font-mono text-slate-100">
                          {tx.transactionPrice != null
                            ? `$${tx.transactionPrice.toFixed(2)}`
                            : "n/a"}
                        </td>
                      </tr>
                    ))}

                    {recent.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-3 text-center text-slate-400">
                          No recent insider transactions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-[10px] text-slate-500">
                Codes: P = open market purchase, S = sale, A = grant or award. M and D entries
                usually relate to options and derivative adjustments rather than direct open market
                trades.
              </p>
            </div>
          </div>
        )}
      </div>
    </LoaderComponent>
  );
}
