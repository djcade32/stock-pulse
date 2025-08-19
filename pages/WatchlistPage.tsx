import Input from "@/components/general/Input";
import WatchlistPageSection from "@/sections/watchlist/WatchlistPageSection";
import WatchlistSummarySection from "@/sections/watchlist/WatchlistSummarySection";
import { Search } from "lucide-react";
import React from "react";

const WatchlistPage = () => {
  return (
    <div className="page">
      <div className="flex items-center justify-between">
        <h1 className="page-header-text">Watchlist</h1>
        <div className="w-[275px]min-w[200px]">
          <Input
            type="text"
            placeholder="Add ticker or company..."
            preIcon={<Search color="var(--secondary-text-color)" size={20} />}
            className="bg-(--secondary-color) border-(--gray-accent-color) py-2"
          />
        </div>
      </div>

      <WatchlistSummarySection />
      <WatchlistPageSection />
    </div>
  );
};

export default WatchlistPage;
