import Button from "@/components/general/Button";
import React from "react";
import { RefreshCcw } from "lucide-react";
import EarningsRow from "@/components/EarningsRow";

const DUMMY_EARNINGS_DATA: {
  date: string;
  ticker: string;
  name: string;
  quarter: string;
  insights: string;
  aiTags: { sentiment: "Positive" | "Negative" | "Neutral"; tag: string }[];
  overallSentiment: string;
}[] = [
  {
    date: "Feb 21, 2024",
    ticker: "NVDA",
    name: "NVIDIA Corp",
    quarter: "Q4 2023",
    insights:
      "CEO Jensen Huang emphasized unprecedented demand for AI computing, with data center revenue growing 409% YoY to $18.4B. The company announced their next-gen Blackwell architecture, projecting 30x performance gains for AI workloads. Supply constraints are easing with increased capacity from TSMC.",
    aiTags: [
      {
        sentiment: "Positive",
        tag: "Record Revenue",
      },
      {
        sentiment: "Positive",
        tag: "AI Demand",
      },
      {
        sentiment: "Neutral",
        tag: "Supply Chain",
      },
      {
        sentiment: "Positive",
        tag: "New Architecture",
      },
    ],
    overallSentiment: "Bullish",
  },
  {
    date: "Feb 20, 2024",
    ticker: "AAPL",
    name: "Apple Inc",
    quarter: "Q1 2024",
    insights:
      "CFO Luca Maestri reported strong iPhone sales, particularly in China, with a 15% YoY increase. Services revenue also hit a record $21B, driven by Apple Music and iCloud. The company is investing heavily in AI and AR technologies.",
    aiTags: [
      {
        sentiment: "Positive",
        tag: "Strong Sales",
      },
      {
        sentiment: "Positive",
        tag: "Record Services Revenue",
      },
      {
        sentiment: "Positive",
        tag: "AI Investment",
      },
    ],
    overallSentiment: "Bullish",
  },
  {
    date: "Feb 19, 2024",
    ticker: "META",
    name: "Meta Platforms Inc",
    quarter: "Q4 2023",
    insights:
      "CEO Andy Jassy highlighted a 25% YoY increase in AWS revenue to $21B, driven by AI and machine learning services. E-commerce sales grew 15% despite supply chain challenges. The company is expanding its logistics network to improve delivery times.",
    aiTags: [
      {
        sentiment: "Positive",
        tag: "AWS Growth",
      },
      {
        sentiment: "Negative",
        tag: "E-commerce Sales",
      },
      {
        sentiment: "Negative",
        tag: "Logistics Expansion",
      },
    ],
    overallSentiment: "Bearish",
  },
];
const EarningsSection = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI-Generated Earnings Call Insights</h2>
        <div>
          <Button className="font-bold !text-(--secondary-text-color)" variant="ghost">
            <RefreshCcw />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-(--secondary-color) rounded-lg px-4 divide-y divide-(--gray-accent-color)">
        {DUMMY_EARNINGS_DATA.map((earnings) => (
          <EarningsRow key={earnings.name} earnings={earnings} />
        ))}
      </div>
    </div>
  );
};

export default EarningsSection;
