"use client";

import AiTag from "@/components/AiTag";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useSentiment } from "@/lib/client/hooks/useSentiment";
import useWatchlistStore from "@/stores/watchlist-store";
import React, { useEffect, useState } from "react";

const WatchlistSummarySection = () => {
  const { watchlist } = useWatchlistStore();
  const [avgSentiment, setAvgSentiment] = useState<number | null>(null);
  const [biggestGainer, setBiggestGainer] = useState<{
    symbol: string;
    change: number;
  } | null>(null);
  const [biggestLoser, setBiggestLoser] = useState<{
    symbol: string;
    change: number;
  } | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const totalNumberOfStocks = watchlist.length;

  // Fetch quotes for all stocks in watchlist
  const { quotesBySymbol, isLoading } = useBatchQuotes(
    watchlist.map((s) => s.symbol),
    {
      enabled: true,
    }
  );

  const { data: sentiments = [], isFetching: isSentFetching } = useSentiment(
    watchlist.map((s) => s.symbol),
    {
      enabled: true,
    }
  );

  const sentimentByTicker = Object.fromEntries(sentiments.map((s) => [s.ticker, s]));

  useEffect(() => {
    if (watchlist.length === 0) {
      setAvgSentiment(0);
      setBiggestGainer(null);
      setBiggestLoser(null);
      return;
    }
    let totalSentiment = 0;
    let maxGainer = -Infinity;
    let maxLoser = Infinity;
    let gainerSymbol = null;
    let loserSymbol = null;

    watchlist.forEach((stock) => {
      const sentiment = sentimentByTicker[stock.symbol];
      if (sentiment) {
        totalSentiment += sentiment.score;
      }

      const quote = quotesBySymbol[stock.symbol];
      if (quote) {
        const percentChange = ((quote.c - quote.pc) / quote.pc) * 100;
        if (percentChange > maxGainer) {
          maxGainer = percentChange;
          gainerSymbol = {
            symbol: stock.symbol,
            change: percentChange,
          };
        }
        if (percentChange < maxLoser) {
          maxLoser = percentChange;
          loserSymbol = {
            symbol: stock.symbol,
            change: percentChange,
          };
        }
      }
    });

    setAvgSentiment((totalSentiment / watchlist.length).toFixed(2) as unknown as number);
    setBiggestGainer(gainerSymbol ? gainerSymbol : null);
    setBiggestLoser(loserSymbol ? loserSymbol : null);
    setIsFirstRun(false);
  }, [isSentFetching, isLoading]);

  const getTag = (sentiment: string): "Neutral" | "Bullish" | "Bearish" => {
    switch (sentiment) {
      case "Positive":
        return "Bullish";
      case "Neutral":
        return "Neutral";
      case "Negative":
        return "Bearish";
      default:
        return "Neutral";
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {isLoading || isSentFetching || isFirstRun ? (
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
              <p className="text-2xl font-bold">{totalNumberOfStocks}</p>
              {/* <AiTag
            tag={{
              sentiment: "Positive",
              topic: "+2 this week",
            }}
          /> */}
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Average Sentiment</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{avgSentiment}</p>
              <AiTag
                tag={{
                  sentiment: avgSentiment
                    ? avgSentiment >= 70
                      ? "Positive"
                      : avgSentiment < 50
                      ? "Negative"
                      : "Neutral"
                    : "Neutral",
                  topic: getTag(
                    avgSentiment
                      ? avgSentiment >= 70
                        ? "Positive"
                        : avgSentiment < 50
                        ? "Negative"
                        : "Neutral"
                      : "Neutral"
                  ),
                }}
              />
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Gainer</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{biggestGainer?.symbol}</p>
              <AiTag
                tag={{
                  sentiment: biggestGainer?.change
                    ? biggestGainer.change > 0
                      ? "Positive"
                      : biggestGainer.change < 0
                      ? "Negative"
                      : "Neutral"
                    : "Neutral",
                  topic: biggestGainer?.change ? `+${biggestGainer.change.toFixed(2)}%` : "0%",
                }}
              />
            </div>
          </div>

          <div className="watchlist-summary-card">
            <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Loser</h3>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{biggestLoser?.symbol}</p>
              <AiTag
                tag={{
                  sentiment: biggestLoser?.change
                    ? biggestLoser.change < 0
                      ? "Negative"
                      : biggestLoser.change > 0
                      ? "Positive"
                      : "Neutral"
                    : "Neutral",
                  topic: biggestLoser?.change ? `${biggestLoser.change.toFixed(2)}%` : "0%",
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
