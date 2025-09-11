import DashboardHeader from "@/sections/dashboard/DashboardHeader";
import EarningsSection from "@/sections/dashboard/EarningsSection";
import NewsSection from "@/sections/dashboard/NewsSection";
import QuickChartsSection from "@/sections/dashboard/QuickChartsSection";
import WatchlistSection from "@/sections/dashboard/WatchlistSection";
import WatchlistSectionHeader from "@/sections/watchlist/WatchlistSectionHeader";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="page">
      <DashboardHeader />

      <QuickChartsSection />
      <div>
        <WatchlistSectionHeader />
        <WatchlistSection />
      </div>
      <EarningsSection />
      <NewsSection />
    </div>
  );
};

export default DashboardPage;
