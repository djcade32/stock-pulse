import Link from "next/link";
import React from "react";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import { AITag, ReportRowDTO } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AiTagProps {
  tag: AITag;
  className?: string;
}

const AiTag = ({ tag, className }: AiTagProps) => {
  return (
    <span
      className={cn(
        "inline-block text-[10px] px-1 py-[2px] rounded-full text-center font-bold tracking-tight overflow-hidden whitespace-nowrap text-ellipsis",
        tag.sentiment.toLocaleLowerCase() == "positive" &&
          "bg-(--success-color)/30 text-(--success-color)",
        tag.sentiment.toLocaleLowerCase() == "negative" &&
          "bg-(--danger-color)/30 text-(--danger-color)",
        tag.sentiment.toLocaleLowerCase() == "neutral" &&
          "bg-(--warning-color)/30 text-(--warning-color)",
        className
      )}
    >
      {tag.topic}
    </span>
  );
};

interface EarningsRowProps {
  earnings: ReportRowDTO;
}

const EarningsRowPreview = ({ earnings }: EarningsRowProps) => {
  const { date, ticker, name, quarter, insights, aiTags, overallSentiment, url } = earnings;
  const { url: logoUrl } = useCompanyLogo(ticker);

  const getSentiment = (sentiment: string): "Positive" | "Neutral" | "Negative" => {
    switch (sentiment) {
      case "Bullish":
        return "Positive";
      case "Mixed":
        return "Neutral";
      case "Bearish":
        return "Negative";
      default:
        return "Neutral";
    }
  };

  return (
    <div className="group py-2 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <div>
            {logoUrl.data ? (
              <img
                src={logoUrl.data}
                alt={`${ticker} logo`}
                className="w-7 h-7 rounded-lg bg-white"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                <p>{ticker[0]}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm">{`${name} (${ticker})`}</h3>
            </div>
            {url ? (
              <div className="text-[10px] text-(--secondary-text-color) font-bold ">{`${quarter} Report • ${date}`}</div>
            ) : (
              <p className="text-xs text-(--secondary-text-color) font-bold">{`${quarter} Report • ${date}`}</p>
            )}
          </div>
        </div>
        <div>
          <AiTag tag={{ sentiment: getSentiment(overallSentiment), topic: overallSentiment }} />
        </div>
      </div>

      <div>
        <p className="leading-relax text-[10px]">{insights}</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {aiTags.slice(0, 6).map((tag, index) => (
            <AiTag key={index} tag={tag} />
          ))}
          {aiTags.length > 6 && (
            <AiTag
              className={"bg-(--gray-accent-color) text-(--secondary-text-color)"}
              tag={{ topic: `+${aiTags.length - 6} more`, sentiment: "Neutral" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsRowPreview;
