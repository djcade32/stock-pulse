import Link from "next/link";
import React from "react";
import { FaNewspaper } from "react-icons/fa6";
import AiTag from "./AiTag";

interface NewsRowProps {
  news: {
    title: string;
    source: string;
    date: string;
    summary: string;
    sentiment: "Positive" | "Negative" | "Neutral";
    elapsedTime: string;
  };
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

const NewsRow = ({ news }: NewsRowProps) => {
  const { title, source, date, summary, sentiment, elapsedTime } = news;
  return (
    <div className="flex items-start gap-4">
      <div>
        <div className="w-8 h-10 rounded-lg bg-(--accent-color)/10 flex items-center justify-center">
          <FaNewspaper color="var(--accent-color)" />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Link href={`/news/${title}`} className="hover:brightness-75 transition-all duration-200">
            <h3 className="font-bold">{title}</h3>
          </Link>
          <p className="text-xs text-(--secondary-text-color) font-bold">{elapsedTime}</p>
        </div>
        <p className="text-sm text-(--secondary-text-color) leading-tight">{summary}</p>
        <div className="flex items-center gap-4">
          <p className="text-xs text-(--secondary-text-color) font-bold">{`Source: ${source}`}</p>
          <AiTag
            tag={{
              sentiment: sentiment,
              tag: getTag(sentiment),
            }}
            className="text-xs py-0"
          />
        </div>
      </div>
    </div>
  );
};

export default NewsRow;
