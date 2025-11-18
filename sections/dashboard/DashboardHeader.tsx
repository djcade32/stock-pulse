"use client";

import Button from "@/components/general/Button";
import AddStockModal from "@/modals/AddStockModal";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa6";

const DashboardHeader = () => {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header-text">Dashboard</h1>
        </div>
        <div>
          <Button
            className="flex-1/2 font-bold text-sm md:text-base"
            onClick={() => setIsAddStockModalOpen(true)}
          >
            <FaPlus />
            Add Stock
          </Button>
        </div>
      </div>
      <AddStockModal open={isAddStockModalOpen} setOpen={setIsAddStockModalOpen} watchlistOnly />
    </>
  );
};

export default DashboardHeader;
