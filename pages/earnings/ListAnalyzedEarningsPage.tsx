"use client";

import Button from "@/components/general/Button";
import StockSearch from "@/components/StockSearch";
import React, { useEffect, useState } from "react";
import { FileChartColumn } from "lucide-react";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
import EarningsRow from "@/components/earnings/EarningsRow";
import { Select } from "@/components/general/Select";
import { getCurrentQuarter } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

const quarterFilterOptions = [
  { label: "Q1", value: "Q1" },
  { label: "Q2", value: "Q2" },
  { label: "Q3", value: "Q3" },
  { label: "Q4", value: "Q4" },
];

const ListAnalyzedEarningsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbol = searchParams?.get("symbol");
  const quarter = searchParams?.get("quarter");
  const year = searchParams?.get("year");
  const [yearFilter, setYearFilter] = useState(year || new Date().getFullYear().toString());
  const [quarterFilter, setQuarterFilter] = useState(quarter || getCurrentQuarter());
  const [selectedStock, setSelectedStock] = useState<string | undefined>(symbol || undefined);
  const [endReach, setEndReach] = useState(false);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isFetching } =
    useReportsFeedInfinite(30, selectedStock, yearFilter, quarterFilter);
  const rows = (data?.pages ?? []).flatMap((p) => p.rows);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setEndReach(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (endReach && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
      setEndReach(false);
    }
  }, [endReach]);

  useEffect(() => {
    setEndReach(false);
  }, [selectedStock, yearFilter, quarterFilter]);

  useEffect(() => {
    if (isLoading) return;
    refetch();
  }, [selectedStock, yearFilter, quarterFilter]);

  const handleStockChange = (value: string) => {
    if (value === "") {
      setSelectedStock(undefined);
      return;
    }
    setSelectedStock(value);
  };

  const handleAnalyzeEarningsClick = () => {
    router.push("/earnings/analyze");
  };

  // Grab the last 3 years as options
  const getYearFilterOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    let i = 0;
    while (i < 3) {
      const option = (currentYear - i).toString();
      options.push({ label: option, value: option });
      i++;
    }
    return options;
  };

  return (
    <div className="page h-full">
      {/* <div className="flex items-center justify-between"> */}
      <Breadcrumb className="flex items-center justify-between">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="page-header-text">Earnings</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
        <div className="flex items-center gap-4">
          <StockSearch
            className="w-[430px] min-w[100px]"
            placeholder="Search for earnings analysis by ticker or company..."
            onSelect={(item) => handleStockChange(item.symbol)}
            onChange={(value) => {
              if (value === "") {
                handleStockChange("");
              }
            }}
            value={symbol || ""}
          />

          <div className="flex items-center gap-4">
            <Select
              value={yearFilter}
              onValueChange={(value) => {
                setYearFilter(value);
                router.push(
                  `/earnings?${symbol ? symbol + "&" : ""}year=${value}&quarter=${quarterFilter}`
                );
              }}
              items={getYearFilterOptions()}
            />
            <Select
              value={quarterFilter}
              onValueChange={(value) => {
                setQuarterFilter(value);
                router.push(
                  `/earnings?${symbol ? symbol + "&" : ""}year=${yearFilter}&quarter=${value}`
                );
              }}
              items={quarterFilterOptions}
            />
            <Button className="flex-1/2 font-bold" onClick={handleAnalyzeEarningsClick}>
              <FileChartColumn />
              Analyze Earnings
            </Button>
          </div>
        </div>
      </Breadcrumb>

      {/* </div> */}

      <div className="flex flex-col gap-4 h-full">
        {isLoading ||
          (isFetching &&
            [...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-[188px] bg-(--secondary-color) rounded-lg animate-pulse"
              />
            )))}
        {!isLoading && rows.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="py-6 text-(--secondary-text-color)">No analyzed filings found</p>
          </div>
        )}
        {rows.map((item, index) => (
          <div key={index} className="bg-(--secondary-color) rounded-lg px-4">
            <EarningsRow earnings={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListAnalyzedEarningsPage;
