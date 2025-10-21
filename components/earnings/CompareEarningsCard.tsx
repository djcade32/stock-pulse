"use client";

import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import { AITag, ReportRowDTO } from "@/types";
import React, { useMemo } from "react";
import CompareEarningsCardRow from "./CompareEarningsCardRow";
import AiTag from "../AiTag";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
import LoaderComponent from "../general/LoaderComponent";

interface CompareEarningsCardProps {
  stock: string;
  report: ReportRowDTO | null;
  isLoading: boolean;
  isFetching: boolean;
}

const CompareEarningsCard = ({
  stock,
  report,
  isFetching,
  isLoading,
}: CompareEarningsCardProps) => {
  const ticker = report?.ticker ?? "";
  const name = report?.name ?? "";
  const quarter = report?.quarter ?? "";
  const { url: logoUrl } = useCompanyLogo(ticker);

  const { quotesBySymbol, isLoading: isLoadingQuotes } = useBatchQuotes([ticker], {
    enabled: !!ticker,
    marketRefetchMs: 60_000,
  });

  const quote = ticker ? quotesBySymbol[ticker] : undefined;

  const { price, dollarChange, percentChange, isPositive } = useMemo(() => {
    if (!quote || typeof quote.c !== "number" || typeof quote.pc !== "number" || quote.pc === 0) {
      return {
        price: null as number | null,
        dollarChange: null as number | null,
        percentChange: null as number | null,
        isPositive: null as boolean | null,
      };
    }
    const p = quote.c;
    const d = p - quote.pc;
    const pct = (d / quote.pc) * 100;
    return { price: p, dollarChange: d, percentChange: pct, isPositive: pct > 0 };
  }, [quote]);

  const revenuePerformance = report?.revenue_performance ?? null;
  const riskFactors = report?.risk_factors ?? null;
  const managementTone = report?.management_tone ?? null;
  const overallSentiment = report?.overallSentiment ?? "Neutral";

  const aiTag: AITag = useMemo(
    () => ({
      sentiment:
        overallSentiment === "Bullish"
          ? "positive"
          : overallSentiment === "Bearish"
          ? "negative"
          : "neutral",
      topic: overallSentiment,
    }),
    [overallSentiment]
  );

  if (!report && !isLoading && !isFetching) {
    return (
      <div className="bg-(--secondary-color) p-4 rounded-lg flex-1 flex items-center justify-center">
        <p className="text-(--secondary-text-color)">
          {stock ? `No report found for ${stock}` : "No report selected"}
        </p>
      </div>
    );
  }

  return (
    <LoaderComponent
      className="bg-(--secondary-color) p-4 rounded-lg flex-1 flex flex-col"
      loading={isLoading || isFetching}
      height="424px"
      width="50%"
      rounded="lg"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex-shrink-0">
          {logoUrl.data ? (
            <img
              src={logoUrl.data}
              alt={`${ticker} logo`}
              className="!w-10 h-10 rounded-lg bg-white bg-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
              <p>{ticker?.[0] ?? "?"}</p>
            </div>
          )}
        </div>
        <div className="w-full ml-2 overflow-hidden">
          <h3 className="font-bold">{ticker}</h3>
          <p className="text-xs text-(--secondary-text-color) font-medium text-ellipsis w-[90%] overflow-hidden text-nowrap">
            {name} • {quarter}
          </p>
        </div>
        <div>
          {isLoadingQuotes ? (
            <div className="h-6 w-20 bg-(--gray-accent-color) rounded-lg animate-pulse" />
          ) : price !== null ? (
            <div className="flex flex-col items-end justify-center font-bold">
              <p className="text-lg">{`$${price.toFixed(2)}`}</p>
              {dollarChange !== null && percentChange !== null && (
                <p
                  className={`text-sm font-medium ${
                    isPositive === null
                      ? "text-(--secondary-text-color)"
                      : isPositive
                      ? "text-(--success-color)"
                      : "text-(--danger-color)"
                  }`}
                >
                  ({isPositive ? "+" : ""}
                  {percentChange.toFixed(2)}%)
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col flex-1 justify-between gap-4">
        <CompareEarningsCardRow
          title="Revenue Performance"
          content={revenuePerformance}
          color="green"
        />
        <CompareEarningsCardRow title="Risk Factors" content={riskFactors} color="red" />
        <CompareEarningsCardRow title="Management Tone" content={managementTone} />
      </div>

      <div className="mt-4 flex justify-end">
        <AiTag tag={aiTag} />
      </div>
    </LoaderComponent>
  );
};

export default CompareEarningsCard;
