"use client";

import Button from "@/components/general/Button";
import React from "react";
import { FaFilter } from "react-icons/fa6";
import { RefreshCcw } from "lucide-react";
import NewsRow from "@/components/NewsRow";
import Link from "next/link";

const DUMMY_NEWS_DATA: {
  title: string;
  date: string;
  source: string;
  summary: string;
  sentiment: "Positive" | "Negative" | "Neutral";
  elapsedTime: string;
}[] = [
  {
    title: "NVIDIA Reports Record Revenue Driven by AI Demand",
    date: "Feb 21, 2024",
    source: "TechCrunch",
    summary:
      "NVIDIA's Q4 earnings call revealed a staggering 409% YoY growth in data center revenue, driven by unprecedented demand for AI computing.",
    sentiment: "Neutral",
    elapsedTime: "2h ago",
  },
  {
    title: "Apple's Q1 Earnings Exceed Expectations with Strong iPhone Sales",
    date: "Feb 20, 2024",
    source: "Reuters",
    summary:
      "Apple reported a 15% YoY increase in iPhone sales, particularly in China, and record services revenue of $21B.",
    sentiment: "Positive",
    elapsedTime: "4h ago",
  },
  {
    title: "Tesla's Q4 Earnings Miss Estimates Amid Production Challenges",
    date: "Feb 19, 2024",
    source: "Bloomberg",
    summary:
      "Tesla's Q4 earnings fell short of expectations due to production delays and supply chain issues, with a 10% YoY decline in vehicle deliveries.",
    sentiment: "Negative",
    elapsedTime: "6h ago",
  },
];

const NewsSection = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recent Market News</h2>
        <div className="flex items-center gap-4">
          <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
            <FaFilter />
            Filter
          </Button>
          <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
            <RefreshCcw />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-(--secondary-color) rounded-lg p-4 flex flex-col gap-4 ">
        {DUMMY_NEWS_DATA.map((news, index) => (
          <NewsRow key={index} news={news} />
        ))}
        <div>
          <Link
            href="/news"
            className="text-center text-(--accent-color) text-sm mt-4 hover:brightness-125 transition-all duration-200"
          >
            <p>View All News</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;
