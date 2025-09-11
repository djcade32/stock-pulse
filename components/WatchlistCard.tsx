"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { FaNewspaper } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";
import { Ellipsis, Trash2 } from "lucide-react";
import AiTag from "./AiTag";
import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import DropdownMenu from "./general/DropdownMenu";
import useWatchlistStore from "@/stores/watchlist-store";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";

interface WatchlistCardProps {
  stock: {
    name: string;
    ticker: string;
    price: number;
    percentChange: number;
    dollarChange: string;
    sentimentScore: number;
    numOfNews: number;
    aiTags?: {
      sentiment: "Positive" | "Negative" | "Neutral";
      tag: string;
    }[];
    sentimentSummary: string;
  };
  fullDetails?: boolean;
}

export const WatchlistCard = ({ stock, fullDetails = true }: WatchlistCardProps) => {
  const {
    name,
    ticker,
    price,
    percentChange,
    dollarChange,
    sentimentScore,
    numOfNews,
    aiTags = [],
    sentimentSummary,
  } = stock;

  const { url: logoUrl } = useCompanyLogo(ticker);
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
    <div className="group card flex-col justify-between">
      <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
      <div className="flex flex-col w-full">
        <div className="flex justify-between w-full">
          <div className="flex gap-2 w-full">
            <Link href={`/stocks/${ticker}`} className="flex-shrink-0">
              {logoUrl.data ? (
                <img
                  src={logoUrl.data}
                  alt={`${ticker} logo`}
                  className="!w-10 h-10 rounded-lg bg-white bg-cover"
                />
              ) : (
                //   <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
                <div className="w-10 h-10 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                  <p>{ticker[0]}</p>
                </div>
              )}
            </Link>
            <div className="flex flex-col justify-between w-full">
              <Link
                href={`/stocks/${ticker}`}
                className="hover:brightness-75 transition-all duration-200"
              >
                <h3 className="font-bold">{ticker}</h3>
              </Link>
              <p className="text-xs text-(--secondary-text-color) font-medium text-ellipsis w-[90%] overflow-hidden text-nowrap">
                {name}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end flex-shrink-0">
            <h3 className="font-bold">${price}</h3>

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

        <div className="w-full mt-4">
          <div>
            <div className="text-sm flex items-center justify-between">
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

          <div className="flex items-center mt-4 gap-1">
            {aiTags.length > 0 && aiTags.map((tag, index) => <AiTag key={index} tag={tag} />)}
          </div>

          <div>
            <p className="text-sm text-(--secondary-text-color) mt-4 leading-tight">
              {sentimentSummary.length > 100
                ? `${sentimentSummary.slice(0, 100)}...`
                : sentimentSummary}
            </p>
          </div>
        </div>
      </div>

      <DropdownMenu
        className="w-10 bg-(--secondary-color) shadow-lg border border-(--gray-accent-color)"
        renderTrigger={
          <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
        }
        items={[
          {
            icon: <Trash2 size={12} color="var(--danger-color" />,
            label: "Remove",
            onClick: handleRemove,
          },
        ]}
        side="right"
      />

      {fullDetails ? (
        <div className="flex justify-between mt-4 w-full">
          <Link href={`/news/${ticker}`} className="watchlist-card-link">
            <FaNewspaper size={15} className="mr-1" />
            News ({numOfNews})
          </Link>
          <Link href={`/news/${ticker}`} className="watchlist-card-link">
            <FaMicrophoneAlt size={15} className="mr-1" />
            Earnings
          </Link>
        </div>
      ) : (
        // <Button className="mt-4">
        <Link href={`/stocks/${ticker}`} className="flex items-center justify-center gap-2">
          Learn More
        </Link>
        // </Button>
      )}
    </div>
  );
};

export default WatchlistCard;
