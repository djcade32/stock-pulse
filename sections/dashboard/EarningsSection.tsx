"use client";

import Button from "@/components/general/Button";
import { Button as RootButton } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useRefreshReports, useReportsFeed } from "@/lib/client/queries/reports";
import EarningsRow from "@/components/EarningsRow"; // reuse same row component
import { useState } from "react";
import LastRefreshedBadge from "@/components/reports/LastRefreshedBadge";
import { useEnsureLatestOnOpen } from "@/lib/client/hooks/useEnsureLatestOnOpen";
import Link from "next/link";

export default function EarningsSection() {
  useEnsureLatestOnOpen();
  const { data, isLoading, isError, error } = useReportsFeed();
  const refreshReports = useRefreshReports();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshReports().finally(() => setIsRefreshing(false));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI-Generated Earnings Insights</h2>
        <div className="flex items-center gap-2">
          <LastRefreshedBadge />
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
        {!isLoading && !isError && (!data?.rows || data.rows.length === 0) && (
          <div className="py-6 text-(--secondary-text-color)">
            <p className="text-center">No analyzed filings yet</p>
          </div>
        )}
        {data?.rows.slice(0, 3)?.map((row) => (
          <EarningsRow key={`${row.ticker}-${row.date}`} earnings={row} />
        ))}
        {data?.rows && data.rows.length > 0 && (
          <div className="py-4 flex justify-center">
            <RootButton
              asChild
              className="text-(--accent-color) hover:brightness-125 transition-all duration-200"
            >
              <Link href="/earnings">
                <p>View All Insights</p>
              </Link>
            </RootButton>
          </div>
        )}
      </div>
    </div>
  );
}
