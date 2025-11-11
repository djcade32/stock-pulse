import AiTag from "@/components/AiTag";
import LoaderComponent from "@/components/general/LoaderComponent";
import { useSentiment } from "@/lib/client/hooks/useSentiment";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

interface StockSentimentSectionProps {
  symbol: string;
}

const StockSentimentSection = ({ symbol }: StockSentimentSectionProps) => {
  const { data: sentiments = [], isFetching } = useSentiment([symbol], {
    enabled: true,
  });
  const sentimentByTicker = Object.fromEntries(sentiments.map((s) => [s.ticker, s]));

  const sentimentSummary = sentimentByTicker[symbol]?.summary || "No AI summary available";
  const sentimentScore = sentimentByTicker[symbol]?.score || 0;
  const aiTags = sentimentByTicker[symbol]?.tags || [];

  const getSentiment = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 50) return "Neutral";
    return "Bearish";
  };

  return (
    <LoaderComponent
      className="bg-(--secondary-color) px-6 py-4 rounded-lg"
      height="10rem"
      width="100%"
      loading={isFetching}
      rounded="lg"
      loadingClassName="bg-(--secondary-color)"
    >
      <div className="w-full flex flex-col flex-1 min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-(--secondary-text-color) font-bold ">Sentiment Score</p>
            <p
              className={cn(
                "text-(--warning-color) font-medium",
                getSentiment(sentimentScore) === "Bullish" && "text-(--success-color)",
                getSentiment(sentimentScore) === "Bearish" && "text-(--danger-color)"
              )}
            >
              {sentimentScore} {getSentiment(sentimentScore)}
            </p>
          </div>
          <div className="bg-(--gray-accent-color) h-2 rounded mt-1">
            <div
              className="h-full rounded"
              style={{
                width: `${sentimentScore}%`,
                backgroundColor:
                  getSentiment(sentimentScore) === "Bullish"
                    ? "var(--success-color)"
                    : getSentiment(sentimentScore) === "Bearish"
                    ? "var(--danger-color)"
                    : "var(--warning-color)",
              }}
            />
          </div>
        </div>

        <div className="flex items-center mt-4 gap-1 flex-wrap">
          {aiTags.length > 0 &&
            aiTags.map((tag, index) => <AiTag key={index} tag={tag} className="text-sm" />)}
        </div>

        <div className="flex-1 min-h-0 mt-2">
          <p className="text-(--secondary-text-color)">{sentimentSummary}</p>
        </div>
      </div>
    </LoaderComponent>
  );
};

export default StockSentimentSection;
