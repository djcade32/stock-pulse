"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaNewspaper } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";
import { Ellipsis, Minus } from "lucide-react";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import DropdownMenu from "./general/DropdownMenu";
import useWatchlistStore from "@/stores/watchlist-store";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";
import { AITag, WatchlistCard as WatchlistCardType } from "@/types";

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

type WatchlistCardTypePreview = WatchlistCardType & {
  logoUrl: string;
};

interface WatchlistCardProps {
  stock: WatchlistCardTypePreview;
}

export const WatchlistCardPreview = ({ stock }: WatchlistCardProps) => {
  const {
    name,
    logoUrl,
    ticker,
    price,
    percentChange,
    dollarChange,
    sentimentScore,
    numOfNews,
    aiTags = [],
    sentimentSummary,
    type,
    latestEarningsDate,
  } = stock;

  const { removeFromWatchlist, watchlist } = useWatchlistStore();
  const { uid } = useUid();

  const isPositiveChange = percentChange >= 0;

  const getSentiment = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 50) return "Neutral";
    return "Bearish";
  };

  const handleRemove = async () => {
    // Implement the logic to remove the stock from the watchlist
    console.log(`Removing ${ticker} from watchlist`);
    removeFromWatchlist(ticker);
    // Remove from firebase as well
    const ref = doc(db, "watchlists", uid!);
    await setDoc(
      ref,
      {
        uid,
        stocks: watchlist.filter((s) => s.symbol !== ticker),
      },
      { merge: true }
    );
  };

  return (
    <div className="group w-full bg-(--secondary-color) rounded-lg p-3 flex items-center overflow-hidden relative flex-col justify-between h-full">
      <div className="flex flex-col w-full flex-1">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 w-full items-center">
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${ticker} logo`}
                  className="!w-7 h-7 rounded-sm bg-white bg-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                  <p>{ticker[0]}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-between w-full">
              <div>
                <h3 className="font-bold text-sm">{ticker}</h3>
              </div>
              <p className="text-[10px] text-(--secondary-text-color) font-medium text-ellipsis w-[80%] overflow-hidden text-nowrap">
                {name}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0 text-[10px]">
            <h3 className="font-bold text-sm">${price}</h3>

            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                isPositiveChange ? "text-(--success-color)" : "text-(--danger-color)"
              }`}
            >
              <p>
                {isPositiveChange ? "+" : "-"}
                {dollarChange}
              </p>
              <p>
                ({isPositiveChange && "+"}
                {percentChange}%)
              </p>
            </div>
          </div>
        </div>

        <div className="w-full mt-4 flex flex-col flex-1 min-h-0">
          <div>
            <div className="text-sm flex items-center justify-between">
              <p className="text-(--secondary-text-color) font-bold text-xs">Sentiment Score</p>
              <p
                className={cn(
                  "text-(--warning-color) font-medium text-xs",
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

          <div
            className="flex items-center mt-4 gap-1 flex-wrap overflow-hidden"
            style={{ maxHeight: "calc(2 * (1.5rem + 0.25rem))" }}
          >
            {aiTags.length > 0 && aiTags.map((tag, index) => <AiTag key={index} tag={tag} />)}
          </div>

          <div className="flex-1 min-h-0 mt-2">
            <p
              className="text-xs text-(--secondary-text-color) leading-tight h-full overflow-hidden pr-1 text-ellipsis"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {sentimentSummary}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-4 w-full">
        <div className="text-(--secondary-text-color) text-xs flex items-center">
          <FaNewspaper size={15} className="mr-1" />
          News
        </div>
        <div className="text-(--secondary-text-color) text-xs flex items-center">
          <FaMicrophoneAlt size={15} className="mr-1" />
          Earnings
        </div>
      </div>
    </div>
  );
};

export default WatchlistCardPreview;
