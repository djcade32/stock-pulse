import Link from "next/link";
import React from "react";
import AiTag from "../AiTag";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import { ReportRowDTO } from "@/types";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface EarningsRowProps {
  earnings: ReportRowDTO;
}

const EarningsRow = ({ earnings }: EarningsRowProps) => {
  const { date, ticker, name, quarter, insights, aiTags, overallSentiment, url } = earnings;
  const { url: logoUrl } = useCompanyLogo(ticker);
  const isMobile = useIsMobile();

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
    <div className="group py-4 flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Link href={`/stock?symbol=${ticker}`} className="shrink-0">
            {logoUrl.data ? (
              <img
                src={logoUrl.data}
                alt={`${ticker} logo`}
                className="w-10 h-10 rounded-lg bg-white"
              />
            ) : (
              //   <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
              <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                <p>{ticker[0]}</p>
              </div>
            )}
          </Link>
          <div className="flex flex-col justify-between">
            <Link
              href={`/stock?symbol=${ticker}`}
              className="hover:brightness-75 transition-all duration-200"
            >
              <h3 className="font-bold">{`${name} (${ticker})`}</h3>
            </Link>
            {url ? (
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-(--secondary-text-color) font-bold hover:brightness-75"
              >{`${quarter} Report • ${date}`}</Link>
            ) : (
              <p className="text-xs text-(--secondary-text-color) font-bold">{`${quarter} Report • ${date}`}</p>
            )}
          </div>
        </div>
        <div className="hidden md:block">
          <AiTag tag={{ sentiment: getSentiment(overallSentiment), topic: overallSentiment }} />
        </div>
      </div>

      <div className="">
        <p className="leading-6 text-sm line-clamp-3">{insights}</p>
      </div>

      <div className="flex justify-between items-end flex-col gap-3 md:flex-row">
        <div className="flex flex-wrap gap-2">
          {aiTags.slice(0, isMobile ? 4 : 6).map((tag, index) => (
            <AiTag key={index} tag={tag} />
          ))}
          {aiTags.length > (isMobile ? 4 : 6) && (
            <AiTag
              className={"bg-(--gray-accent-color) text-(--secondary-text-color)"}
              tag={{ topic: `+${aiTags.length - 6} more`, sentiment: "Neutral" }}
            />
          )}
        </div>
        <div className="flex md:block items-center justify-between w-full md:w-auto mt-2 md:mt-0">
          <div className="md:hidden">
            <AiTag tag={{ sentiment: getSentiment(overallSentiment), topic: overallSentiment }} />
          </div>
          <Link
            href={{
              pathname: `/earnings/${earnings.ticker.toLocaleUpperCase()}`,
              query: {
                q: format(new Date(earnings.date), "yyyy-MM-dd"),
              },
            }}
            className="hover:brightness-125 smooth-animation md:opacity-0 group-hover:opacity-100 "
          >
            <p className="text-xs text-(--accent-color) font-bold text-nowrap">
              Read Full Analysis
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EarningsRow;
