import Link from "next/link";
import React from "react";
import { FaNewspaper } from "react-icons/fa6";
import AiTag from "./AiTag";
import { News } from "@/types";

interface NewsRowProps {
  news: News;
  isNewsPage?: boolean;
}

const getTag = (sentiment: string): "Mixed" | "Bullish" | "Bearish" => {
  switch (sentiment) {
    case "Positive":
      return "Bullish";
    case "Neutral":
      return "Mixed";
    case "Negative":
      return "Bearish";
    default:
      return "Mixed";
  }
};

const NewsRow = ({ news, isNewsPage }: NewsRowProps) => {
  const { title, source, summary, sentiment, timeElapsed, url } = news;
  return (
    <div className="flex items-start gap-4">
      {!isNewsPage && (
        <div>
          <div className="w-8 h-10 rounded-lg bg-(--accent-color)/10 flex items-center justify-center">
            <FaNewspaper color="var(--accent-color)" />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={url}
            className="hover:brightness-75 transition-all duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="font-bold">{title}</h3>
          </Link>
          <div className="w-max flex-shrink-0">
            <p className="text-xs text-(--secondary-text-color) font-bold">{timeElapsed}</p>
          </div>
        </div>
        <p className="text-sm text-(--secondary-text-color) leading-tight">{summary}</p>
        <div className="flex items-center gap-4">
          <p className="text-xs text-(--secondary-text-color) font-bold">{`Source: ${source}`}</p>
          <AiTag
            tag={{
              sentiment: sentiment,
              topic: getTag(sentiment),
            }}
            className="text-xs py-0"
          />
        </div>
      </div>
    </div>
  );
};

export default NewsRow;
