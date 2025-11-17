"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import StockSearch from "@/components/StockSearch";
import { Select } from "@/components/general/Select";
import { ReportRowDTO, StockHit } from "@/types";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";

import Button from "@/components/general/Button";
import { FileSearch } from "lucide-react";
import CompareEarningsCard from "@/components/earnings/CompareEarningsCard";
import { useCompareFilings } from "@/lib/client/queries/compareFilings";
import CompareEarningsAICard from "@/components/earnings/CompareEarningsAICard";

const CompareEarningsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const sA = searchParams?.get("sA")?.toLocaleUpperCase();
  const quarterA = searchParams?.get("quarterA");
  const yearA = searchParams?.get("yearA");

  const [stockA, setStockA] = useState(sA || "");
  const [quarterFilterA, setQuarterFilterA] = useState(quarterA || "");
  const [yearFilterA, setYearFilterA] = useState(yearA || "");
  const [currentReportA, setCurrentReportA] = useState<ReportRowDTO | null>(null);

  const sB = searchParams?.get("sB")?.toLocaleUpperCase();
  const quarterB = searchParams?.get("quarterB");
  const yearB = searchParams?.get("yearB");

  const [stockB, setStockB] = useState(sB || "");
  const [quarterFilterB, setQuarterFilterB] = useState(quarterB || "");
  const [yearFilterB, setYearFilterB] = useState(yearB || "");
  const [currentReportB, setCurrentReportB] = useState<ReportRowDTO | null>(null);

  const {
    data: stockAData,
    isLoading: isLoadingStockAData,
    isFetching: isFetchingStockAData,
  } = useReportsFeedInfinite(30, stockA, "", "", !!stockA);
  const stockARows = (stockAData?.pages ?? []).flatMap((p) => p.rows);

  const {
    data: stockBData,
    isLoading: isLoadingStockBData,
    isFetching: isFetchingStockBData,
  } = useReportsFeedInfinite(30, stockB, "", "", !!stockB);
  const stockBRows = (stockBData?.pages ?? []).flatMap((p) => p.rows);

  const { isFetching: isFetchingCompare, refetch: refetchCompare } = useCompareFilings(
    currentReportA,
    currentReportB,
    false
  );

  useEffect(() => {
    if (!!stockARows.length) {
      const foundReport = stockARows.find((row) => row.quarter === `10-Q ${quarterA} ${yearA}`);
      if (foundReport) setCurrentReportA(foundReport);
    } else {
      setCurrentReportA(null);
    }
  }, [stockARows]);

  useEffect(() => {
    if (!!stockBRows.length) {
      const foundReport = stockBRows.find((row) => row.quarter === `10-Q ${quarterB} ${yearB}`);
      if (foundReport) setCurrentReportB(foundReport);
    } else {
      setCurrentReportB(null);
    }
  }, [stockARows]);

  // After getting comparison, scroll to AI card
  useEffect(() => {
    if (!isFetchingCompare) {
      console.log("Scrolling to AI card");
      const aiCard = document.getElementById("compare-earnings-ai-card");
      if (aiCard) {
        aiCard.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isFetchingCompare]);

  const getAvailableYears = (rows: ReportRowDTO[]) => {
    const years: string[] = [];
    rows.forEach((row) => {
      const year = row.quarter.split(" ")[2];
      if (!years.includes(year)) years.push(year);
    });
    // Convert to options
    const options = years.map((year) => {
      return {
        label: year,
        value: year,
      };
    });
    return options;
  };

  const getAvailableQuarters = (rows: ReportRowDTO[], year: string) => {
    const quarters: string[] = [];
    rows
      .filter((row) => row.quarter.split(" ")[2] === year)
      .forEach((row) => {
        const quarter = row.quarter.split(" ")[1];
        if (!quarters.includes(quarter)) quarters.push(quarter);
      });
    // Convert to options
    const options = quarters.map((quarter) => {
      return {
        label: quarter,
        value: quarter,
      };
    });
    return options;
  };

  const changeYearFilter = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setYearFilterA(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${value}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
    } else {
      setYearFilterB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${value}&quarterB=${quarterFilterB}`
      );
    }
  };

  const changeQuarterFilter = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setQuarterFilterA(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${value}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
    } else {
      setQuarterFilterB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${stockB}&yearB=${yearFilterB}&quarterB=${value}`
      );
    }
  };

  const changeStock = (value: string, filter: "A" | "B") => {
    if (filter === "A") {
      setStockA(value);
      router.replace(
        `/earnings/compare?sA=${value}&yearA=&quarterA=&sB=${stockB}&yearB=${yearFilterB}&quarterB=${quarterFilterB}`
      );
      setYearFilterA("");
      setQuarterFilterA("");
    } else {
      setStockB(value);
      router.replace(
        `/earnings/compare?sA=${stockA}&yearA=${yearFilterA}&quarterA=${quarterFilterA}&sB=${value}&yearB=&quarterB=`
      );
      setYearFilterB("");
      setQuarterFilterB("");
    }
  };

  const handleCompareClick = () => {
    refetchCompare();
  };

  return (
    <div className="page">
      <h1 className="page-header-text">Compare Earnings</h1>

      <div className="bg-(--secondary-color) p-4 rounded-lg">
        <div className="flex gap-4 justify-center flex-col md:flex-row">
          <div className="flex flex-col flex-1">
            <p className="mb-1">Select Company A</p>
            <StockSearch
              inputClassName="bg-(--background) h-10"
              value={stockA}
              onSelect={(e) => changeStock((e as StockHit).symbol, "A")}
            />
            <div className="flex gap-2 w-[50%] mt-2">
              <Select
                value={yearFilterA}
                onValueChange={(value) => changeYearFilter(value, "A")}
                items={getAvailableYears(stockARows)}
                className="bg-(--background)"
              />
              <Select
                value={quarterFilterA}
                onValueChange={(value) => changeQuarterFilter(value, "A")}
                items={getAvailableQuarters(stockARows, yearFilterA)}
                className="bg-(--background)"
              />
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <p className="mb-1">Select Company B</p>
            <StockSearch
              inputClassName="bg-(--background) h-10"
              value={stockB}
              onSelect={(e) => changeStock((e as StockHit).symbol, "B")}
            />
            <div className="flex gap-2 w-[50%] mt-2">
              <Select
                value={yearFilterB}
                onValueChange={(value) => changeYearFilter(value, "B")}
                items={getAvailableYears(stockBRows)}
                className="bg-(--background)"
              />
              <Select
                value={quarterFilterB}
                onValueChange={(value) => changeQuarterFilter(value, "B")}
                items={getAvailableQuarters(stockBRows, yearFilterB)}
                className="bg-(--background)"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleCompareClick}
            disabled={!currentReportA || !currentReportB || isFetchingCompare}
            showLoading={isFetchingCompare}
            className="md:w-auto w-full"
          >
            <FileSearch />
            <p>Compare Earnings</p>
          </Button>
        </div>
      </div>

      <div className="flex gap-6 md:gap-4 mt-4 flex-col md:flex-row">
        <div className="w-full">
          <h2 className="font-semibold mb-2 md:hidden">Company A</h2>
          <CompareEarningsCard
            stock={stockA}
            report={currentReportA}
            isLoading={isLoadingStockAData}
            isFetching={isFetchingStockAData}
          />
        </div>
        <div className="w-full">
          <h2 className="font-semibold mb-2 md:hidden">Company B</h2>
          <CompareEarningsCard
            stock={stockB}
            report={currentReportB}
            isLoading={isLoadingStockBData}
            isFetching={isFetchingStockBData}
          />
        </div>
      </div>
      <CompareEarningsAICard currentReportA={currentReportA} currentReportB={currentReportB} />
    </div>
  );
};

export default CompareEarningsPage;
