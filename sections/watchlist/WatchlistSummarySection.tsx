import AiTag from "@/components/AiTag";
import React from "react";

const WatchlistSummarySection = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="watchlist-summary-card">
        <h3 className="text-sm text-(--secondary-text-color) font-bold">Total Stocks</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">8</p>
          <AiTag
            tag={{
              sentiment: "Positive",
              tag: "+2 this week",
            }}
          />
        </div>
      </div>

      <div className="watchlist-summary-card">
        <h3 className="text-sm text-(--secondary-text-color) font-bold">Average Sentiment</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">0.64</p>
          <AiTag
            tag={{
              sentiment: "Positive",
              tag: "Bullish",
            }}
          />
        </div>
      </div>

      <div className="watchlist-summary-card">
        <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Gainer</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">NVDA</p>
          <AiTag
            tag={{
              sentiment: "Positive",
              tag: "+3.42%",
            }}
          />
        </div>
      </div>

      <div className="watchlist-summary-card">
        <h3 className="text-sm text-(--secondary-text-color) font-bold">Biggest Loser</h3>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">META</p>
          <AiTag
            tag={{
              sentiment: "Negative",
              tag: "-1.85%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WatchlistSummarySection;
