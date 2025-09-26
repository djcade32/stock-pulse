"use client";

import React, { useEffect, useState } from "react";
import router, { useSearchParams, useRouter } from "next/navigation";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
import { getQuarterFromDate } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Select } from "@/components/general/Select";
import { AITag, KPI, ReportRowDTO } from "@/types";
import { format } from "date-fns";
import AiTag from "@/components/AiTag";
import Button from "@/components/general/Button";
import { ExternalLink } from "lucide-react";
import FinancialMetricsCard from "@/components/FinancialMetricsCard";

const quarterFilterOptions = [
  { label: "Q1", value: "Q1" },
  { label: "Q2", value: "Q2" },
  { label: "Q3", value: "Q3" },
  { label: "Q4", value: "Q4" },
];

const FullEarningsAnalysisPage = () => {
  const route = useRouter();
  const symbol = router.useParams()?.symbol as string;
  const searchParams = useSearchParams();
  const date = searchParams?.get("q");
  const { data, isLoading } = useReportsFeedInfinite(30, symbol);
  const rows = (data?.pages ?? []).flatMap((p) => p.rows);
  const [yearFilter, setYearFilter] = useState(date ? new Date(date).getFullYear().toString() : "");
  const [quarterFilter, setQuarterFilter] = useState(
    date ? getQuarterFromDate(new Date(date)) : ""
  );
  const [currentReport, setCurrentReport] = useState<ReportRowDTO | null>(null);

  useEffect(() => {
    const validDate = date && !isNaN(new Date(date).getTime());
    if (!symbol || !date || !validDate) {
      route.push("/earnings");
    }

    if (!!rows.length) {
      console.log("rows: ", rows[0]);
      const foundReport = rows.find((row) => format(row.date, "yyyy-MM-dd") === date);
      setCurrentReport(foundReport ?? null);
    }
  }, [date, symbol, rows]);

  // Get available years to view
  const getAvailableYears = (rows: ReportRowDTO[]) => {
    const years: string[] = [];
    rows.forEach((row) => {
      const year = new Date(row.date).getFullYear().toString();
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
      <Breadcrumb className="flex items-center justify-between">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink className="page-header-text hover:brightness-75" href="/earnings">
              Earnings
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-(--secondary-text-color)" />
          <BreadcrumbItem>
            <BreadcrumbLink className="page-header-text">{symbol.toUpperCase()}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>

        <div className="flex items-center gap-4">
          <Select
            value={yearFilter}
            onValueChange={setYearFilter}
            items={getAvailableYears(rows)}
          />
          <Select
            value={quarterFilter}
            onValueChange={setQuarterFilter}
            items={quarterFilterOptions}
          />
        </div>
      </Breadcrumb>
      <div className="flex flex-col gap-4">
        <div className="bg-(--secondary-color) p-4 rounded-lg ">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 items-center">
              {!currentReport ? (
                isLoading && (
                  <div className="h-6 w-40 bg-(--gray-accent-color) rounded-lg animate-pulse" />
                )
              ) : (
                <h2 className="font-bold text-xl">{`${currentReport?.name} (${
                  currentReport?.ticker
                }) - ${currentReport?.quarter.split("10-Q")[1]}`}</h2>
              )}
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
            </div>
            <Button onClick={() => window.open(currentReport?.url, "_blank")}>
              <p>View Report</p>
              <ExternalLink />
            </Button>
          </div>
          <div>
            <p className="text-(--secondary-text-color)">{`10-Q Report • ${currentReport?.date}`}</p>
          </div>
          <div className="mt-4">
            <h3 className="font-bold text-lg mb-2">Key Highlights</h3>
            <ul className="list-none list-inside space-y-1">
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
                        className="w-2 h-2 rounded-full inline-block"
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
            <div className="flex flex-wrap gap-2">
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
            <p className="text-(--secondary-text-color) ">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!currentReport
              ? isLoading &&
                [...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="h-[92px] w-[298px] bg-(--gray-accent-color) rounded-lg animate-pulse"
                  />
                ))
              : currentReport.kpis?.map((kpi, index) => (
                  <FinancialMetricsCard key={index} kpi={kpi} />
                ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullEarningsAnalysisPage;
