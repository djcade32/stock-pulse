"use client";

import Button from "@/components/general/Button";
import { ArrowDownWideNarrow, Grid2x2 } from "lucide-react";
import React from "react";

const WatchlistSectionHeader = () => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">Watchlist Sentiment</h2>
      <div className="flex items-center gap-4">
        <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
          <ArrowDownWideNarrow />
          Sort
        </Button>
        <Button className="!bg-(--secondary-color) flex-1/2 font-bold">
          <Grid2x2 />
          View
        </Button>
      </div>
    </div>
  );
};

export default WatchlistSectionHeader;
