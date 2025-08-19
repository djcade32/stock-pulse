import { Select } from "@/components/general/Select";
import WatchlistCard from "@/components/WatchlistCard";
import React from "react";

const DUMMY_STOCK_DATA: {
  name: string;
  ticker: string;
  price: number;
  percentChange: number;
  dollarChange: string;
  sentimentScore: number;
  numOfNews: number;
  aiTags?: { sentiment: "Positive" | "Negative" | "Neutral"; tag: string }[];
  sentimentSummary: string;
}[] = [
  {
    name: "Tesla, Inc.",
    ticker: "TSLA",
    price: 207.35,
    percentChange: 2.61,
    dollarChange: "$5.28",
    sentimentScore: 78,
    numOfNews: 12,
    aiTags: [
      { sentiment: "Positive", tag: "Cybertruck" },
      { sentiment: "Positive", tag: "FSD Expansion" },
      { sentiment: "Negative", tag: "Production Delays" },
    ],
    sentimentSummary:
      "Strong sentiment driven by Cybertruck delivery announcement and FSD expansions.",
  },
  {
    name: "Apple Inc.",
    ticker: "AAPL",
    price: 175.05,
    percentChange: 1.45,
    dollarChange: "$2.50",
    sentimentScore: 65,
    numOfNews: 8,
    aiTags: [
      { sentiment: "Positive", tag: "iPhone Sales" },
      { sentiment: "Positive", tag: "AI Integration" },
      { sentiment: "Negative", tag: "Supply Chain" },
    ],
    sentimentSummary: "Positive sentiment from strong iPhone sales and AI integration.",
  },
  {
    name: "Amazon.com, Inc.",
    ticker: "AMZN",
    price: 135.2,
    percentChange: 0.75,
    dollarChange: "$1.00",
    sentimentScore: 55,
    numOfNews: 5,
    aiTags: [
      { sentiment: "Positive", tag: "AWS Growth" },
      { sentiment: "Negative", tag: "Retail Challenges" },
      { sentiment: "Neutral", tag: "Prime Membership" },
    ],
    sentimentSummary: "Mixed sentiment with AWS growth offset by retail challenges.",
  },
  {
    name: "Alphabet Inc.",
    ticker: "GOOGL",
    price: 2800.5,
    percentChange: 1.2,
    dollarChange: "$33.60",
    sentimentScore: 70,
    numOfNews: 10,
    aiTags: [
      { sentiment: "Positive", tag: "AI Advancements" },
      { sentiment: "Neutral", tag: "Ad Revenue" },
    ],
    sentimentSummary: "Positive sentiment from AI advancements and ad revenue growth.",
  },
  {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: 300.75,
    percentChange: -0.9,
    dollarChange: "$2.70",
    sentimentScore: 49,
    numOfNews: 6,
    aiTags: [
      { sentiment: "Positive", tag: "AI Investments" },
      { sentiment: "Negative", tag: "Regulatory Scrutiny" },
      { sentiment: "Neutral", tag: "Windows Updates" },
    ],
    sentimentSummary:
      "Neutral sentiment with mixed reactions to Windows updates and AI investments.",
  },
  {
    name: "Netflix, Inc.",
    ticker: "NFLX",
    price: 450.0,
    percentChange: -3.0,
    dollarChange: "$13.50",
    sentimentScore: 37,
    numOfNews: 4,
    aiTags: [
      {
        sentiment: "Positive",
        tag: "Streaming",
      },
      {
        sentiment: "Negative",
        tag: "Subscriber Losses",
      },
    ],
    sentimentSummary: "Negative sentiment due to subscriber losses and content costs.",
  },
  {
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    price: 500.0,
    percentChange: 3.5,
    dollarChange: "$17.50",
    sentimentScore: 85,
    numOfNews: 15,
    aiTags: [
      { sentiment: "Positive", tag: "AI Demand" },
      { sentiment: "Positive", tag: "Data Center Growth" },
      { sentiment: "Neutral", tag: "Gaming Revenue" },
    ],
    sentimentSummary: "Extremely positive sentiment driven by AI demand and data center growth.",
  },
  {
    name: "Advanced Micro Devices, Inc.",
    ticker: "AMD",
    price: 120.0,
    percentChange: 2.0,
    dollarChange: "$2.40",
    sentimentScore: 60,
    numOfNews: 9,
    aiTags: [
      { sentiment: "Positive", tag: "Chip Demand" },
      { sentiment: "Neutral", tag: "Market Competition" },
    ],
    sentimentSummary: "Positive sentiment from chip demand, but concerns over market competition.",
  },
];
const options_prefix = "Sort by: ";
const SORT_BY_OPTIONS = [
  { label: options_prefix + "Alphabetical", value: "alphabetical" },
  { label: options_prefix + "Price", value: "price" },
  { label: options_prefix + "Percent Change %", value: "percentChange" },
  { label: options_prefix + "Sentiment Score", value: "sentimentScore" },
];

const FILTER_BY_OPTIONS = [
  { label: "All Sentiment", value: "all" },
  { label: "Positive", value: "positive" },
  { label: "Negative", value: "negative" },
  { label: "Neutral", value: "neutral" },
];

const WatchlistPageSection = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="page-subheader-text">Your Watchlist</h2>
        <div className="flex items-center gap-4">
          <Select items={SORT_BY_OPTIONS} />
          <Select items={FILTER_BY_OPTIONS} />
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DUMMY_STOCK_DATA.map((stock, index) => (
            <WatchlistCard key={index} stock={stock} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WatchlistPageSection;
