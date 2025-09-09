"use client";

import Button from "@/components/general/Button";
import WatchlistCard from "@/components/WatchlistCard";
import React from "react";
import { ArrowDownWideNarrow, Grid2x2 } from "lucide-react";
import { useQuoteStreamPatcher } from "@/lib/client/hooks/useQuoteStreamPatcher";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";

const DUMMY_STOCK_DATA: {
  name: string;
  ticker: string;
  price: number;
  percentChange: number;
  dollarChange: string;
  sentimentScore: number;
  numOfNews: number;
  aiTags?: { sentiment: "Positive" | "Negative" | "Neutral"; tag: string }[];
  sentimentSummary: string;
}[] = [
  {
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: 207.35,
    percentChange: 2.61,
    dollarChange: "$5.28",
    sentimentScore: 78,
    numOfNews: 12,
    aiTags: [
      { sentiment: "Positive", tag: "Cybertruck" },
      { sentiment: "Positive", tag: "FSD Expansion" },
      { sentiment: "Negative", tag: "Production Delays" },
    ],
    sentimentSummary:
      "Strong sentiment driven by Cybertruck delivery announcement and FSD expansions.",
  },
  {
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 175.05,
    percentChange: 1.45,
    dollarChange: "$2.50",
    sentimentScore: 65,
    numOfNews: 8,
    aiTags: [
      { sentiment: "Positive", tag: "iPhone Sales" },
      { sentiment: "Positive", tag: "AI Integration" },
      { sentiment: "Negative", tag: "Supply Chain" },
    ],
    sentimentSummary: "Positive sentiment from strong iPhone sales and AI integration.",
  },
  {
    name: "Amazon.com, Inc.",
    ticker: "AMZN",
    price: 135.2,
    percentChange: 0.75,
    dollarChange: "$1.00",
    sentimentScore: 55,
    numOfNews: 5,
    aiTags: [
      { sentiment: "Positive", tag: "AWS Growth" },
      { sentiment: "Negative", tag: "Retail Challenges" },
      { sentiment: "Neutral", tag: "Prime Membership" },
    ],
    sentimentSummary: "Mixed sentiment with AWS growth offset by retail challenges.",
  },
  {
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    price: 2800.5,
    percentChange: 1.2,
    dollarChange: "$33.60",
    sentimentScore: 70,
    numOfNews: 10,
    aiTags: [
      { sentiment: "Positive", tag: "AI Advancements" },
      { sentiment: "Neutral", tag: "Ad Revenue" },
    ],
    sentimentSummary: "Positive sentiment from AI advancements and ad revenue growth.",
  },
  {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: 300.75,
    percentChange: -0.9,
    dollarChange: "$2.70",
    sentimentScore: 49,
    numOfNews: 6,
    aiTags: [
      { sentiment: "Positive", tag: "AI Investments" },
      { sentiment: "Negative", tag: "Regulatory Scrutiny" },
      { sentiment: "Neutral", tag: "Windows Updates" },
    ],
    sentimentSummary:
      "Neutral sentiment with mixed reactions to Windows updates and AI investments.",
  },
  {
    name: "Netflix, Inc.",
    ticker: "NFLX",
    price: 450.0,
    percentChange: -3.0,
    dollarChange: "$13.50",
    sentimentScore: 37,
    numOfNews: 4,
    aiTags: [
      {
        sentiment: "Positive",
        tag: "Streaming",
      },
      {
        sentiment: "Negative",
        tag: "Subscriber Losses",
      },
    ],
    sentimentSummary: "Negative sentiment due to subscriber losses and content costs.",
  },
];

const WatchlistSection = () => {
  const STOCK_TICKERS = DUMMY_STOCK_DATA.map((s) => s.ticker);
  const { quotesBySymbol, isLoading, isFetching, errorsBySymbol } = useBatchQuotes(STOCK_TICKERS, {
    enabled: true,
  });

  useQuoteStreamPatcher(STOCK_TICKERS);

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {DUMMY_STOCK_DATA.map((stock) => (
          <div key={stock.ticker} className="card h-[247px] animate-pulse" />
        ))}
      </div>
    );
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Watchlist Sentiment</h2>
        <div className="flex items-center gap-4">
          <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
            <ArrowDownWideNarrow />
            Sort
          </Button>
          <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
            <Grid2x2 />
            View
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DUMMY_STOCK_DATA.map((stock) => {
          const quote = quotesBySymbol[stock.ticker];
          const error = errorsBySymbol[stock.ticker];
          if (error) console.error(`Error loading quote for ${stock.ticker}: ${error}`);
          if (!quote) console.warn(`No quote data for ${stock.ticker}`);
          if (!quote || error) return null;

          stock.price = Number(quote.c.toFixed(2)) || 0;
          stock.dollarChange = `$${(quote.c - quote.pc).toFixed(2)}` || stock.dollarChange;
          stock.percentChange = Number((((quote.c - quote.pc) / quote.pc) * 100).toFixed(2)) || 0;
          return <WatchlistCard key={stock.ticker} stock={stock} />;
        })}
      </div>
    </div>
  );
};

export default WatchlistSection;
