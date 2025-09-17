"use client";

import Button from "@/components/general/Button";
import AddStockModal from "@/modals/AddStockModal";
import WatchlistSection from "@/sections/dashboard/WatchlistSection";
import WatchlistSummarySection from "@/sections/watchlist/WatchlistSummarySection";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";

const WatchlistPage = () => {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  return (
    <>
      <div className="page">
        <div className="flex items-center justify-between">
          <h1 className="page-header-text">Watchlist</h1>
          <div className="flex items-center gap-4">
            <Button className="flex-1/2 font-bold" onClick={() => setIsAddStockModalOpen(true)}>
              <FaPlus />
              Add Stock
            </Button>
          </div>
        </div>

        <WatchlistSummarySection />
        <WatchlistSection isWatchlistPage />
      </div>
      <AddStockModal open={isAddStockModalOpen} setOpen={setIsAddStockModalOpen} />
    </>
  );
};

export default WatchlistPage;
