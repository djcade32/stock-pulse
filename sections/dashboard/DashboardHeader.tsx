"use client";

import Button from "@/components/general/Button";
import React from "react";
import { FaFilter, FaPlus } from "react-icons/fa6";

const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="page-header-text">Dashboard</h1>
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
  );
};

export default DashboardHeader;
