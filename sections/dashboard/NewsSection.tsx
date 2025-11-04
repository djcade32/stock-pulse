"use client";

import Button from "@/components/general/Button";
import { Button as RootButton } from "@/components/ui/button";
import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import NewsRow from "@/components/NewsRow";
import Link from "next/link";
import { useFetchMarketNews, useRefreshMarketNews } from "@/lib/client/queries/markeNews";

const NewsSection = () => {
  const { data, isLoading } = useFetchMarketNews();
  const refreshMarketNews = useRefreshMarketNews();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    console.log("Refreshing market news...");
    setIsRefreshing(true);
    refreshMarketNews().finally(() => setIsRefreshing(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Market News</h2>
        <div className="flex items-center gap-4">
          <Button
            className="font-bold !text-(--secondary-text-color)"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      <div
        className={`bg-(--secondary-color) rounded-lg p-4 flex flex-col gap-4 ${
          isLoading && "animate-pulse"
        }`}
      >
        {isLoading && (
          <>
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="h-[73.5px]" />
            ))}
          </>
        )}
        {data?.slice(0, 3).map((news, index) => (
          <NewsRow key={index} news={news} />
        ))}
        <div className="flex justify-center">
          <RootButton
            asChild
            className="text-(--accent-color) hover:brightness-125 transition-all duration-200"
          >
            <Link href="/news">
              <p>View All News</p>
            </Link>
          </RootButton>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
