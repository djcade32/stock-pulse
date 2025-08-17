import QuickChart from "@/components/QuickChart";
import React from "react";

const DUMMY_STOCK_DATA = [
  { ticker: "S&P 500", price: 4587.64, change: 1.2 },
  { ticker: "NASDAQ", price: 14567.89, change: -0.5 },
  { ticker: "VIX", price: 18.27, change: 3.3 },
];

const QuickChartsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {DUMMY_STOCK_DATA.map((stock) => (
        <QuickChart key={stock.ticker} stock={stock} />
      ))}
    </div>
  );
};

export default QuickChartsSection;
