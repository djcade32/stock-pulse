import Button from "@/components/general/Button";
import DashboardHeader from "@/sections/dashboard/DashboardHeader";
import EarningsSection from "@/sections/dashboard/EarningsSection";
import NewsSection from "@/sections/dashboard/NewsSection";
import QuickChartsSection from "@/sections/dashboard/QuickChartsSection";
import WatchlistSection from "@/sections/dashboard/WatchlistSection";
import React from "react";
import { FaFilter, FaPlus } from "react-icons/fa6";

const DashboardPage = () => {
  return (
    <div className="page">
      <DashboardHeader />

      <QuickChartsSection />
      <WatchlistSection />
      <EarningsSection />
      <NewsSection />
    </div>
  );
};

export default DashboardPage;
