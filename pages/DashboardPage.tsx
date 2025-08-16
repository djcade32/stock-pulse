import Button from "@/components/general/Button";
import QuickChart from "@/components/QuickChart";
import React from "react";
import { FaFilter, FaPlus } from "react-icons/fa6";

const DUMMY_STOCK_DATA = [
  { ticker: "S&P 500", price: 4587.64, change: 1.2 },
  { ticker: "NASDAQ", price: 14567.89, change: -0.5 },
  { ticker: "VIX", price: 18.27, change: 3.3 },
];

const DashboardPage = () => {
  return (
    <div className="py-1 px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
            <FaFilter />
            Filter
          </Button>
          <Button className="flex-1/2 font-bold">
            <FaPlus />
            Add Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {DUMMY_STOCK_DATA.map((stock) => (
          <QuickChart stock={stock} />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
