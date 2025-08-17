import Button from "@/components/general/Button";
import EarningsSection from "@/sections/dashboard/EarningsSection";
import NewsSection from "@/sections/dashboard/NewsSection";
import QuickChartsSection from "@/sections/dashboard/QuickChartsSection";
import WatchlistSection from "@/sections/dashboard/WatchlistSection";
import React from "react";
import { FaFilter, FaPlus } from "react-icons/fa6";

const DashboardPage = () => {
  return (
    <div className="py-1 px-10 flex flex-col gap-7 pb-4">
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

      <QuickChartsSection />
      <WatchlistSection />
      <EarningsSection />
      <NewsSection />
    </div>
  );
};

export default DashboardPage;
