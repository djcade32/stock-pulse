"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
import { Select } from "@/components/general/Select";
import { ReportRowDTO } from "@/types";
import { format } from "date-fns";
import AiTag from "@/components/AiTag";
import Button from "@/components/general/Button";
import { ExternalLink, FileSearch } from "lucide-react";

import EarningsFinancialMetricsCard from "@/components/earnings/EarningsFinancialMetricsCard";

const FullEarningsAnalysisPage = () => {
  const router = useRouter();
  const params = useParams<{ symbol?: string }>();
  const searchParams = useSearchParams();

  const symbol = (params?.symbol ?? "").toUpperCase();
  const date = searchParams?.get("q") || "";

  const { data, isLoading } = useReportsFeedInfinite(30, symbol);
  const rows = useMemo(() => (data?.pages ?? []).flatMap((p) => p.rows), [data]);

  const [yearFilter, setYearFilter] = useState("");
  const [quarterFilter, setQuarterFilter] = useState("");
  const [currentReport, setCurrentReport] = useState<ReportRowDTO | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const validDate = date && !isNaN(new Date(date).getTime());
    if (!symbol || !date || !validDate) {
      router.push("/earnings");
      return;
    }

    if (!!rows.length) {
      const foundReport = rows.find((row) => format(row.date, "yyyy-MM-dd") === date);
      setCurrentReport(foundReport ?? null);
      if (foundReport) {
        setQuarterFilter(foundReport.quarter.split(" ")[1]);
        setYearFilter(foundReport.quarter.split(" ")[2]);
      }
    }
    setIsInitialLoad(false);
  }, [date, symbol, rows]);

  useEffect(() => {
    const yearAndQuarterString = `${quarterFilter} ${yearFilter}`;
    if (!yearFilter || !quarterFilter) return;
    if (!rows.length) return;
    if (isInitialLoad) return;
    if (currentReport && currentReport.quarter.includes(yearAndQuarterString)) return;
    const sameYearReports = rows.filter((row) => row.quarter.includes(yearFilter));
    const foundReports = sameYearReports.filter((row) => row.quarter.includes(quarterFilter));
    const foundReport = foundReports.length > 0 ? foundReports[0] : sameYearReports[0];

    router.replace(
      `/earnings/${symbol}?q=${foundReport ? format(foundReport.date, "yyyy-MM-dd") : ""}`
    );
    setCurrentReport(foundReport ?? null);
  }, [yearFilter, quarterFilter]);

  // Get available years to view
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

  const getSentiment = (sentiment: string): "Positive" | "Neutral" | "Negative" => {
    switch (sentiment) {
      case "Bullish":
        return "Positive";
      case "Bearish":
        return "Negative";
      default:
        return "Neutral";
    }
  };

  const getListDotColor = (sentiment: string) => {
    switch (sentiment) {
      case "Bullish":
      case "Positive":
        return "var(--success-color)";
      case "Bearish":
      case "Negative":
        return "var(--danger-color)";
      default:
        return "var(--warning-color)";
    }
  };

  return (
    <div className="page h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="page-header-text">Earnings</h1>

        <div className="flex items-center gap-4 ">
          <Select
            value={yearFilter}
            onValueChange={setYearFilter}
            items={getAvailableYears(rows)}
          />
          <Select
            value={quarterFilter}
            onValueChange={setQuarterFilter}
            items={getAvailableQuarters(rows, yearFilter)}
          />
          <Button
            onClick={() =>
              router.push(
                `/earnings/compare?sA=${symbol.toLocaleUpperCase()}&quarterA=${quarterFilter}&yearA=${yearFilter}&sB=&quarterB=&yearB=`
              )
            }
            className="bg-(--secondary-color)"
          >
            <FileSearch />
            <p>Compare Earnings</p>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="bg-(--secondary-color) p-4 rounded-lg ">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              {!currentReport ? (
                isLoading && (
                  <div className="h-6 w-40 bg-(--gray-accent-color) rounded-lg animate-pulse" />
                )
              ) : (
                <h2 className="font-bold text-lg md:text-xl">{`${currentReport?.name} (${
                  currentReport?.ticker
                }) - ${currentReport?.quarter.split("10-Q")[1]}`}</h2>
              )}
              {!currentReport ? (
                isLoading && (
                  <div className="h-6 w-20 bg-(--gray-accent-color) rounded-full animate-pulse hidden md:block" />
                )
              ) : (
                <AiTag
                  tag={{
                    sentiment: getSentiment(currentReport?.overallSentiment!),
                    topic: currentReport?.overallSentiment!,
                  }}
                  className="hidden md:block"
                />
              )}
            </div>
            <Button
              onClick={() => window.open(currentReport?.url, "_blank")}
              className="bg-(--secondary-color) border border-(--gray-accent-color) hidden md:flex"
            >
              <ExternalLink />
              <p>View Report</p>
            </Button>
          </div>
          <div>
            <p className="text-(--secondary-text-color)">{`10-Q Report • ${currentReport?.date}`}</p>
          </div>
          <div className="md:hidden flex justify-between items-center mt-2">
            {!currentReport ? (
              isLoading && (
                <div className="h-6 w-20 bg-(--gray-accent-color) rounded-full animate-pulse" />
              )
            ) : (
              <AiTag
                tag={{
                  sentiment: getSentiment(currentReport?.overallSentiment!),
                  topic: currentReport?.overallSentiment!,
                }}
              />
            )}
            <Button
              onClick={() => window.open(currentReport?.url, "_blank")}
              className="bg-(--secondary-color) border border-(--gray-accent-color)"
            >
              <ExternalLink />
              <p>View Report</p>
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Key Highlights</h3>
            <ul className="list-none list-inside space-y-3 md:space-y-2 leading-7">
              {!currentReport
                ? isLoading &&
                  [...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="h-4 bg-(--gray-accent-color) rounded animate-pulse mb-2"
                    />
                  ))
                : currentReport.bulletSummary?.map((point, index) => (
                    <li
                      key={index}
                      className="text-(--secondary-text-color) flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full inline-block shrink-0"
                        style={{
                          backgroundColor: getListDotColor(point.sentiment),
                        }}
                      />
                      <p>{point.bullet}</p>
                    </li>
                  ))}
            </ul>
          </div>
          {/* <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Sentiment Analysis</h3>
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: getListDotColor(currentReport?.overallSentiment!) }}
                />
                <p
                  style={{
                    color: getListDotColor(currentReport?.overallSentiment!),
                  }}
                >{`${currentReport?.overallSentimentScore}0% ${currentReport?.overallSentiment}`}</p>
                <div className="bg-(--gray-accent-color) h-2 rounded flex-1">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${currentReport?.overallSentimentScore}0%`,
                      backgroundColor:
                        getListDotColor(currentReport?.overallSentiment!) || "var(--warning-color)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div> */}
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Key Themes</h3>
            <div className="flex flex-wrap gap-3 md:gap-2">
              {!currentReport
                ? isLoading &&
                  [...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="h-6 w-20 bg-(--gray-accent-color) rounded-full animate-pulse"
                    />
                  ))
                : currentReport.aiTags?.map((tag, index) => <AiTag key={index} tag={tag} />)}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Summary</h3>
            <p className="text-(--secondary-text-color) leading-7">
              {!currentReport
                ? isLoading && (
                    <div className="h-12 bg-(--gray-accent-color) rounded animate-pulse mb-2" />
                  )
                : currentReport.insights || "No summary available for this report."}
            </p>
          </div>
        </div>
        <div className="bg-(--secondary-color) p-4 rounded-lg ">
          <h2 className="font-bold text-xl mb-2">Key Financial Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
            {!currentReport
              ? isLoading &&
                [...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-[92px] md:w-[298px] bg-(--gray-accent-color) rounded-lg animate-pulse"
                  />
                ))
              : currentReport.kpis?.map((kpi, index) => (
                  <EarningsFinancialMetricsCard key={index} kpi={kpi} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullEarningsAnalysisPage;
