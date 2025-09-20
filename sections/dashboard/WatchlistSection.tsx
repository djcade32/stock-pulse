"use client";

import WatchlistCard from "@/components/WatchlistCard";
import React, { useEffect, useState } from "react";
import { useQuoteStreamPatcher } from "@/lib/client/hooks/useQuoteStreamPatcher";
import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useUid } from "@/hooks/useUid";
import useWatchlistStore from "@/stores/watchlist-store";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useSentiment } from "@/lib/client/hooks/useSentiment";
import { Select } from "@/components/general/Select";
import Button from "@/components/general/Button";
import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { AITag, WatchlistCard as WatchlistCardType, WatchlistStock } from "@/types";

const SORT_BY_OPTIONS = [
  { label: "Recently Added", value: "recentlyAdded" },
  { label: "A to Z", value: "aToZ" },
  { label: "Z to A", value: "ZtoA" },
  { label: "Price", value: "price" },
  { label: "Percent Change", value: "percentChange" },
  { label: "Sentiment Score", value: "sentimentScore" },
];

const FILTER_BY_OPTIONS = [
  { label: "All Sentiment", value: "all" },
  { label: "Bullish", value: "positive" },
  { label: "Bearish", value: "negative" },
  { label: "Neutral", value: "neutral" },
];

interface WatchlistSectionProps {
  isWatchlistPage?: boolean;
}

const WatchlistSection = ({ isWatchlistPage }: WatchlistSectionProps) => {
  const { uid, loading } = useUid();
  const { watchlist, setWatchlist } = useWatchlistStore();
  const [filteredWatchlist, setFilteredWatchlist] = useState(watchlist);
  const { isPending } = useQuery({
    queryKey: ["watchlist", uid], // include uid in key so it refetches per user
    queryFn: async () => {
      const watchlisttDoc = doc(db, `watchlists/${uid}`);
      const fetchedDoc = await getDoc(watchlisttDoc);
      // Sort alphabetically by symbol
      if (fetchedDoc.exists() && fetchedDoc.data().stocks) {
        const stocks = fetchedDoc.data().stocks;
        stocks.sort((a: { symbol: string }, b: { symbol: string }) =>
          a.symbol.localeCompare(b.symbol)
        );
        setWatchlist(stocks);
      } else {
        setWatchlist([]);
      }
      return true;
    },
    enabled: !!uid && !loading, // prevent running before uid is ready
  });
  // Fetch quotes for all stocks in watchlist
  const { quotesBySymbol, isLoading, errorsBySymbol } = useBatchQuotes(
    watchlist.map((s) => s.symbol),
    {
      enabled: true,
      marketRefetchMs: 30_000,
    }
  );
  const [sortBy, setSortBy] = React.useState("recentlyAdded");
  const [filterBy, setFilterBy] = React.useState("all");

  // Patch real-time updates to quotes
  useQuoteStreamPatcher(watchlist.map((s) => s.symbol));

  // Fetch sentiment data for all stocks in watchlist
  const { data: sentiments = [], isFetching: isSentFetching } = useSentiment(
    watchlist.map((s) => s.symbol),
    {
      enabled: true,
    }
  );
  const sentimentByTicker = Object.fromEntries(sentiments.map((s) => [s.ticker, s]));

  const handleSortChange = async (
    value: string,
    list: WatchlistStock[]
  ): Promise<WatchlistStock[]> => {
    let sorted = [...list];
    switch (value) {
      case "recentlyAdded":
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // descending
        });
        return sorted;
      case "aToZ":
        sorted.sort((a, b) => a.symbol.localeCompare(b.symbol));
        return sorted;
      case "ZtoA":
        sorted.sort((a, b) => b.symbol.localeCompare(a.symbol));
        return sorted;
      case "price":
        sorted.sort((a, b) => {
          const quoteA = quotesBySymbol[a.symbol];
          const quoteB = quotesBySymbol[b.symbol];
          if (!quoteA || !quoteB) return 0;
          return quoteB.c - quoteA.c; // descending
        });
        return sorted;
      case "percentChange":
        sorted.sort((a, b) => {
          const quoteA = quotesBySymbol[a.symbol];
          const quoteB = quotesBySymbol[b.symbol];
          if (!quoteA || !quoteB) return 0;
          const percentA = ((quoteA.c - quoteA.pc) / quoteA.pc) * 100;
          const percentB = ((quoteB.c - quoteB.pc) / quoteB.pc) * 100;
          return percentB - percentA; // descending
        });
        return sorted;
      case "sentimentScore":
        sorted.sort((a, b) => {
          const sentimentA = sentimentByTicker[a.symbol]?.score || 0;
          const sentimentB = sentimentByTicker[b.symbol]?.score || 0;
          return sentimentB - sentimentA; // descending
        });
        return sorted;
      default:
        return sorted;
    }
  };

  const handleFilterChange = async (
    value: string,
    list: WatchlistStock[]
  ): Promise<WatchlistStock[]> => {
    let filtered = [...list];
    switch (value) {
      case "all":
        // no filter
        return filtered;
      case "positive":
        filtered = filtered.filter((s) => (sentimentByTicker[s.symbol]?.score || 0) > 60);
        return filtered;
      case "negative":
        filtered = filtered.filter((s) => (sentimentByTicker[s.symbol]?.score || 0) < 40);
        return filtered;
      case "neutral":
        console.log("Filtering neutral");
        filtered = filtered.filter(
          (s) =>
            (sentimentByTicker[s.symbol]?.score || 0) >= 40 &&
            (sentimentByTicker[s.symbol]?.score || 0) <= 60
        );
        return filtered;
      default:
        return filtered;
    }
  };

  useEffect(() => {
    handleSortChange(sortBy, watchlist).then((res) =>
      handleFilterChange(filterBy, res).then((final) => setFilteredWatchlist(final))
    );
  }, [watchlist, sortBy, filterBy]);
  useEffect(() => {
    console.log("Watchlist Quotes updated: ", quotesBySymbol);
  }, [quotesBySymbol]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isWatchlistPage ? "Your Watchlist" : "Watchlist Sentiment"}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <Select
              items={SORT_BY_OPTIONS}
              prefix="Sort:"
              value={sortBy}
              onValueChange={setSortBy}
            />
            <Select
              items={FILTER_BY_OPTIONS}
              prefix="Filter:"
              value={filterBy}
              onValueChange={setFilterBy}
            />
          </div>
          {!isWatchlistPage && (
            <Button className="!bg-(--secondary-color) flex-1/2 font-bold" asChild>
              <Link href="/watchlist">
                <GalleryVerticalEnd />
                View All
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(isLoading || isPending) &&
          [1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="card h-[247px] animate-pulse" />
          ))}
        {filteredWatchlist.length === 0 &&
          !(isLoading || isPending || isSentFetching) &&
          !!watchlist.length && (
            <div className="text-(--secondary-text-color) h-[491px] flex items-center justify-center col-span-3">
              <p>No stocks match the filter criteria.</p>
            </div>
          )}
        {watchlist.length === 0 && !(isLoading || isPending || isSentFetching) && (
          <div className="text-(--secondary-text-color) h-[491px] flex items-center justify-center col-span-3">
            <p>Your watchlist is empty. Add some stocks to see them here!</p>
          </div>
        )}
        {(isWatchlistPage ? filteredWatchlist : filteredWatchlist.slice(0, 6)).map(
          ({ symbol, description, type }) => {
            const stock: WatchlistCardType = {
              name: description,
              ticker: symbol,
              type,
              price: 0,
              percentChange: 0,
              dollarChange: "",
              sentimentScore: 50,
              numOfNews: 0,
              sentimentSummary: "Loading sentiment…",
              aiTags: [] as AITag[],
            };

            const quote = quotesBySymbol[stock.ticker];
            const error = errorsBySymbol[stock.ticker];
            if (error) console.error(`Error loading quote for ${stock.ticker}: ${error}`);
            if (!quote) console.warn(`No quote data for ${stock.ticker}`);
            if (!quote || error) return null;

            stock.price = Number(quote.c.toFixed(2)) || 0;
            stock.dollarChange =
              `$${(quote.c - quote.pc).toFixed(2).replace("-", "")}` || stock.dollarChange;
            stock.percentChange = Number((((quote.c - quote.pc) / quote.pc) * 100).toFixed(2)) || 0;
            const s = sentimentByTicker[stock.ticker];
            if (s) {
              stock.sentimentScore = s.score;
              stock.numOfNews = s.numOfNews;
              stock.sentimentSummary = s.summary;
              stock.aiTags = s.tags.map((t) => ({ sentiment: t.sentiment, topic: t.topic }));
            } else {
              // fallback while loading
              stock.sentimentScore = 50;
              stock.numOfNews = 0;
              stock.sentimentSummary = "Loading sentiment…";
              stock.aiTags = [];
            }
            return <WatchlistCard key={stock.ticker} stock={stock} isLoading={isSentFetching} />;
          }
        )}
      </div>
    </div>
  );
};

export default WatchlistSection;
