"use client";

import Button from "@/components/general/Button";
import { RefreshCcw } from "lucide-react";
import { useReportsFeed } from "@/lib/client/queries/reports";
import EarningsRow from "@/components/EarningsRow"; // reuse same row component
import { useState } from "react";

export default function EarningsSection() {
  const { data, isLoading, isError, error, refetch } = useReportsFeed();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    console.log("Refreshing reports feed...");
    setIsRefreshing(true);
    refetch().finally(() => setIsRefreshing(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI-Generated Earnings Insights</h2>
        <div className="flex items-center gap-2">
          <Button
            className="font-bold !text-(--secondary-text-color)"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={isRefreshing ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {/* <AnalyzeLatestButton /> */}
      {/* <AnalyzeFromUrlAdvanced /> */}

      <div
        className={`bg-(--secondary-color) rounded-lg px-4 mt-4 divide-y divide-(--gray-accent-color) ${
          isLoading && "animate-pulse"
        }`}
      >
        {isLoading && (
          <>
            {[1].map((_, index) => (
              <div key={index} className="py-4 h-[209px]" />
            ))}
          </>
        )}
        {isError && (
          <div className="py-6 text-red-500">{(error as Error)?.message ?? "Failed to load"}</div>
        )}
        {!isLoading && !isError && (!data || data.length === 0) && (
          <div className="py-6 text-(--muted-foreground)">No analyzed filings yet.</div>
        )}
        {data?.slice(0, 3)?.map((row) => (
          <EarningsRow key={`${row.ticker}-${row.date}`} earnings={row} />
        ))}
      </div>
    </div>
  );
}
