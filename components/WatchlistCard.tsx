import { cn, fetchCompanyLogo } from "@/lib/utils";
import Link from "next/link";
import { FaNewspaper } from "react-icons/fa6";
import { FaMicrophoneAlt } from "react-icons/fa";
import AiTag from "./AiTag";
import Button from "./general/Button";

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

export const WatchlistCard = async ({ stock, fullDetails = true }: WatchlistCardProps) => {
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

  //   const logoUrl = await fetchCompanyLogo(ticker);
  const logoUrl = null; // Placeholder for now, since fetching is async and we can't use hooks here
  const isPositiveChange = percentChange >= 0;

  const getSentiment = (score: number) => {
    if (score >= 70) return "Bullish";
    if (score >= 50) return "Neutral";
    return "Bearish";
  };

  return (
    <div className="card flex-col justify-between">
      <div className="flex flex-col w-full">
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Link href={`/stocks/${ticker}`}>
              {logoUrl ? (
                <img
                  src={logoUrl}
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
                href={`/stocks/${ticker}`}
                className="hover:brightness-75 transition-all duration-200"
              >
                <h3 className="font-bold">{ticker}</h3>
              </Link>
              <p className="text-xs text-(--secondary-text-color) font-medium">{name}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
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
