import MarketOpenOrClosed from "@/components/MarketOpenOrClosed";
import DashboardHeader from "@/sections/dashboard/DashboardHeader";
import EarningsSection from "@/sections/dashboard/EarningsSection";
import NewsSection from "@/sections/dashboard/NewsSection";
import QuickChartsSection from "@/sections/dashboard/QuickChartsSection";
import WatchlistSection from "@/sections/dashboard/WatchlistSection";
import UpcomingEventsSection from "@/sections/dashboard/UpcomingEventsSection";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="page">
      <DashboardHeader />

      <div>
        <MarketOpenOrClosed />
        <QuickChartsSection />
      </div>
      <WatchlistSection />
      <EarningsSection />
      <UpcomingEventsSection />
      <NewsSection />
    </div>
  );
};

export default DashboardPage;
