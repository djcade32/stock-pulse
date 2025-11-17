"use client";

import AiTag from "@/components/AiTag";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useSentiment } from "@/lib/client/hooks/useSentiment";
import useWatchlistStore from "@/stores/watchlist-store";
import React, { useMemo } from "react";

const WatchlistSummarySection = () => {
  const { watchlist } = useWatchlistStore();
  const symbols = useMemo(() => watchlist.map((s) => s.symbol), [watchlist]);
  const totalNumberOfStocks = symbols.length;

  // Quotes refresh every minute
  const {
    quotesBySymbol = {},
    isLoading: isQuotesLoading,
    isFetchedAfterMount: isQuotesFetched,
    errorsBySymbol = {},
  } = useBatchQuotes(symbols, {
    enabled: totalNumberOfStocks > 0,
  });

  // Sentiment refresh every minute (tweak as needed)
  const {
    data: sentiments = [],
    isLoading: isSentLoading,
    isFetchedAfterMount: isSentFetched,
  } = useSentiment(symbols, {
    enabled: totalNumberOfStocks > 0,
  });

  const sentimentByTicker = useMemo(
    () => Object.fromEntries(sentiments.map((s) => [s.ticker, s])),
    [sentiments]
  );

  const summary = useMemo(() => {
    if (totalNumberOfStocks === 0) {
      return {
        avgSentiment: 0,
        biggestGainer: null as null | { symbol: string; change: number },
        biggestLoser: null as null | { symbol: string; change: number },
      };
    }

    let totalSentiment = 0;
    let countSentiment = 0;

    let maxGainer = -Infinity;
    let maxLoser = Infinity;
    let gainer: null | { symbol: string; change: number } = null;
    let loser: null | { symbol: string; change: number } = null;

    for (const symbol of symbols) {
      const sent = sentimentByTicker[symbol];
      if (sent && typeof sent.score === "number") {
        totalSentiment += sent.score;
        countSentiment += 1;
      }

      const quote = quotesBySymbol[symbol];
      const c = quote?.c;
      const pc = quote?.pc;
      if (typeof c === "number" && typeof pc === "number" && pc !== 0) {
        const pct = ((c - pc) / pc) * 100;
        if (pct > maxGainer) {
          maxGainer = pct;
          gainer = { symbol, change: pct };
        }
        if (pct < maxLoser) {
          maxLoser = pct;
          loser = { symbol, change: pct };
        }
      }
    }

    const avg = countSentiment ? Number((totalSentiment / countSentiment).toFixed(2)) : 0;

    return {
      avgSentiment: avg,
      biggestGainer: gainer,
      biggestLoser: loser,
    };
  }, [symbols, sentimentByTicker, quotesBySymbol, totalNumberOfStocks, errorsBySymbol]);

  const isError = Object.keys(errorsBySymbol).length > 0;
  const loading = isQuotesLoading || isSentLoading || isError;

  const getTag = (sentiment: string): "Neutral" | "Bullish" | "Bearish" => {
    switch (sentiment) {
      case "Positive":
        return "Bullish";
      case "Negative":
        return "Bearish";
      default:
        return "Neutral";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        [...Array(4)].map((_, i) => (
          <div
            key={i}
            className="watchlist-summary-card h-20 rounded-lg bg-(--gray-accent-color) text-(--secondary-text-color) animate-pulse"
          />
        ))
      ) : (
        <>
          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Total Stocks</h3>
            <div className="flex items-center gap-2">
              <p className="text-xl md:text-2xl font-bold">{totalNumberOfStocks}</p>
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Average Sentiment</h3>
            <div className="flex items-center gap-2">
              <p className="text-xl md:text-2xl font-bold">{summary.avgSentiment}</p>
              <AiTag
                tag={{
                  sentiment:
                    summary.avgSentiment >= 70
                      ? "Positive"
                      : summary.avgSentiment < 50
                      ? "Negative"
                      : "Neutral",
                  topic: getTag(
                    summary.avgSentiment >= 70
                      ? "Positive"
                      : summary.avgSentiment < 50
                      ? "Negative"
                      : "Neutral"
                  ),
                }}
              />
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Gainer</h3>
            <div className="flex items-center gap-2">
              <p className="text-xl md:text-2xl font-bold">{summary.biggestGainer?.symbol}</p>
              <AiTag
                tag={{
                  sentiment:
                    (summary.biggestGainer?.change ?? 0) > 0
                      ? "Positive"
                      : (summary.biggestGainer?.change ?? 0) < 0
                      ? "Negative"
                      : "Neutral",
                  topic: summary.biggestGainer
                    ? `+${summary.biggestGainer.change.toFixed(2)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Loser</h3>
            <div className="flex items-center gap-2">
              <p className="text-xl md:text-2xl font-bold">{summary.biggestLoser?.symbol}</p>
              <AiTag
                tag={{
                  sentiment:
                    (summary.biggestLoser?.change ?? 0) < 0
                      ? "Negative"
                      : (summary.biggestLoser?.change ?? 0) > 0
                      ? "Positive"
                      : "Neutral",
                  topic: summary.biggestLoser ? `${summary.biggestLoser.change.toFixed(2)}%` : "0%",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WatchlistSummarySection;
