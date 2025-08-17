import Link from "next/link";
import React from "react";
import AiTag from "./AiTag";
import { fetchCompanyLogo } from "@/lib/utils";

interface EarningsRowProps {
  earnings: {
    date: string;
    ticker: string;
    name: string;
    quarter: string;
    insights: string;
    aiTags: { sentiment: "Positive" | "Negative" | "Neutral"; tag: string }[];
    overallSentiment: string;
  };
}

const EarningsRow = async ({ earnings }: EarningsRowProps) => {
  const { date, ticker, name, quarter, insights, aiTags, overallSentiment } = earnings;
  const logoUrl = await fetchCompanyLogo(ticker);
  //   const logoUrl = null; // Placeholder for now, since fetching is async and we can't use hooks here

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
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Link href={`/stocks/${ticker}`}>
            {logoUrl ? (
              <img src={logoUrl} alt={`${ticker} logo`} className="w-10 h-10 rounded-lg bg-white" />
            ) : (
              //   <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                <p>{ticker[0]}</p>
              </div>
            )}
          </Link>
          <div className="flex flex-col justify-between">
            <Link
              href={`/stocks/${ticker}`}
              className="hover:brightness-75 transition-all duration-200"
            >
              <h3 className="font-bold">{`${name} (${ticker})`}</h3>
            </Link>
            <p className="text-xs text-(--secondary-text-color) font-bold">{`${quarter} Earnings Call • ${date}`}</p>
          </div>
        </div>
        <div>
          <AiTag tag={{ sentiment: getSentiment(overallSentiment), tag: overallSentiment }} />
        </div>
      </div>

      <div>
        <p className="leading-tight text-sm">{insights}</p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {aiTags.map((tag, index) => (
            <AiTag key={index} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsRow;
