"use client";

import React, { useMemo, useState } from "react";
import NewsDisplay from "./NewsDisplay";
import { useFetchMarketNews, useRefreshMarketNews } from "@/lib/client/queries/markeNews";
import { useFetchCompanyNews, useRefreshCompanyNews } from "@/lib/client/hooks/useFetchCompanyNews";
import useWatchlistStore from "@/stores/watchlist-store";
import { useQuery } from "@tanstack/react-query";
import { useUid } from "@/hooks/useUid";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { Select } from "@/components/general/Select";
import Button from "@/components/general/Button";
import { RefreshCcw } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

const selectItems = [
  { label: "All News", value: "all" },
  { label: "Market News", value: "market" },
  { label: "Watchlist News", value: "watchlist" },
];

const NewsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stock = searchParams?.get("q")?.toLocaleUpperCase();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(stock ? "watchlist" : "all");
  const [companyFilter, setCompanyFilter] = useState<string | null>(stock ? stock : null);
  const { watchlist, setWatchlist } = useWatchlistStore();
  const { uid, loading } = useUid();
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
  const { data, isLoading } = useFetchMarketNews();
  const refreshMarketNews = useRefreshMarketNews();

  const { data: watchlistData, isLoading: isWatchlistLoading } = useFetchCompanyNews(
    companyFilter || (watchlist && watchlist[0]?.symbol)
  );
  const refreshCompanyNews = useRefreshCompanyNews(
    companyFilter || (watchlist && watchlist[0]?.symbol)
  );

  const companyOptions = useMemo(() => {
    if (!watchlist || watchlist.length === 0) return [];
    const sorted = [...watchlist].sort((a, b) => a.symbol.localeCompare(b.symbol));
    setCompanyFilter(stock || sorted[0]?.symbol);
    return sorted.map((item) => ({ label: item.symbol, value: item.symbol.toLocaleLowerCase() }));
  }, [watchlist, isPending]);

  const handleSelectChange = (value: string) => {
    setSelectedFilter(value);
    router.replace(
      `/news${value === "all" ? "" : value === "market" ? "?q=" : "?q=" + (companyFilter || "")}`
    );
    // Implement filtering logic based on selected value
  };

  const handleRefresh = () => {
    console.log("Refreshing news...");
    setIsRefreshing(true);
    const promises = [];
    if (selectedFilter === "all" || selectedFilter === "market") {
      promises.push(refreshMarketNews());
    }
    if (selectedFilter === "all" || selectedFilter === "watchlist") {
      promises.push(refreshCompanyNews());
    }
    Promise.all(promises).finally(() => setIsRefreshing(false));
  };

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header-text">News</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedFilter}
            onValueChange={handleSelectChange}
            items={selectItems}
            className="w-[150px] min-w-0"
          />
          <div className="flex items-center gap-4">
            <Button className="flex-1/2 font-bold" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={isRefreshing ? "animate-spin" : ""} /> Refresh
            </Button>
          </div>
        </div>
      </div>
      <div className="flex gap-8">
        {(selectedFilter === "market" || selectedFilter === "all") && (
          <NewsDisplay
            header="Recent Market News"
            news={data}
            isLoading={isLoading}
            className="flex-2/3"
          />
        )}
        {(selectedFilter === "watchlist" || selectedFilter === "all") && (
          <NewsDisplay
            header="Watchlist News"
            news={watchlistData}
            isLoading={isWatchlistLoading || isPending}
            className="flex-1/3"
            companyOptions={companyOptions}
            companyFilter={companyFilter}
            setCompanyFilter={setCompanyFilter}
          />
        )}
      </div>
    </div>
  );
};

export default NewsContent;
