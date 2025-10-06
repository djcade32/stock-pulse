"use client";

import Button from "@/components/general/Button";
import AnalyzeLatestButton from "@/components/reports/AnalyzeLatestButton";
import { FileChartColumn } from "lucide-react";
import { FaPlus } from "react-icons/fa6";

import React, { useEffect, useState } from "react";
import AddStockModal from "@/modals/AddStockModal";
import { ReportRowDTO } from "@/types";
import EarningsRow from "@/components/earnings/EarningsRow";
import { cn } from "@/lib/utils";
import { useReportsFeed } from "@/lib/client/queries/reports";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AnalyzeEarningsPage = () => {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isMounting, setIsMounting] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [analysisData, setAnalysisData] = useState<ReportRowDTO[]>([]);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);
  const { data, isLoading, isError, error } = useReportsFeed();

  useEffect(() => {
    console.log("data changed: ", data);
    if (!isMounting && data?.rows.length) {
      !isFirstLoad && setAnalysisData((prev) => [data.rows[0], ...prev]);
      setIsFirstLoad(false);
    }
    setIsMounting(false);
  }, [data]);

  return (
    <>
      <div className="page h-full">
        <Breadcrumb className="w-full h-[44px] flex items-center">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="page-header-text hover:brightness-75" href="/earnings">
                Earnings
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-(--secondary-text-color)" />
            <BreadcrumbItem>
              <BreadcrumbLink className="page-header-text">Analyze</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col justify-center items-center">
          <div className="w-full max-w-xl">
            <div className="bg-(--secondary-color) rounded-lg px-4 pt-6 pb-2 flex flex-col justify-center items-center">
              <FileChartColumn className="text-(--secondary-text-color) mb-2" size={48} />
              <h1 className="text-2xl font-bold">Analyze Earnings</h1>
              <p className="mt-2 text-(--secondary-text-color)">
                Analyze the latest earnings reports for companies
              </p>
              <div className="p-4 bg-(--background) rounded-lg mt-4 w-full">
                <AnalyzeLatestButton setAnalysisData={setAnalysisData} />
              </div>
              <p className="mt-2 mb-2 text-(--secondary-text-color)">or</p>
              <Button
                className="font-bold w-[40%]"
                onClick={() => setIsAddStockModalOpen(true)}
                variant="success"
                showLoading={addingToWatchlist}
              >
                <FaPlus />
                <p>Add Stock to Watchlist</p>
              </Button>
              <p className="italic text-xs mt-6 text-(--secondary-text-color)">
                Note: Can only analyze the latest 10-Q/10-K report for a company at this time.
              </p>
            </div>
          </div>
          <div className="w-full max-w-6xl mt-8 bg-(--secondary-color) rounded-lg p-4 flex flex-col justify-center items-center">
            <h1 className="page-header-text text-center">Recently Analyzed</h1>
            <div
              className={cn(
                "bg-(--background) rounded-lg p-2 flex items-center mt-2 border border-(--gray-accent-color) min-h-[100px] h-[400px] flex-col gap-2 overflow-y-scroll w-full",
                !analysisData.length && "justify-center"
              )}
            >
              {!analysisData.length && (
                <p className="text-(--secondary-text-color)">No recently analyzed reports</p>
              )}
              {analysisData.length > 0 &&
                analysisData.map((item, index) => (
                  <div key={index} className="bg-(--secondary-color) rounded-lg px-4">
                    <EarningsRow earnings={item} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <AddStockModal
        open={isAddStockModalOpen}
        setOpen={setIsAddStockModalOpen}
        watchlistOnly
        onSubmit={() => setAddingToWatchlist((prev) => !prev)}
      />
    </>
  );
};

export default AnalyzeEarningsPage;
