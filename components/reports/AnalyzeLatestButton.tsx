"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "@/components/general/Button";
import { useAnalyzeLatestReport } from "@/lib/client/mutations/useAnalyzeLatestReport";
import StockSearch from "../StockSearch";
import { toast } from "sonner";
import { ReportRowDTO } from "@/types";

interface AnalyzeLatestButtonProps {
  // Optional: callback to receive analysis data
  setAnalysisData?: Dispatch<SetStateAction<ReportRowDTO[]>>;
}

export default function AnalyzeLatestButton({ setAnalysisData }: AnalyzeLatestButtonProps) {
  const [ticker, setTicker] = useState<string | undefined>("");
  const [stockName, setStockName] = useState<string | undefined>("");
  const { mutate, isPending, error, data } = useAnalyzeLatestReport();

  useEffect(() => {
    if (error) {
      toast.error((error as Error).message);
      return;
    }
    if (data && setAnalysisData) {
      setAnalysisData((prev) => {
        // Avoid duplicates
        if (prev.find((r) => r.ticker === data.ticker)) return prev;
        return [data, ...prev];
      });
      return;
    }
  }, [error, data]);

  const handleAnalyzeClicked = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ticker) {
      mutate({ ticker, name: stockName || ticker });
    }
    setTicker("");
    setStockName("");
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleAnalyzeClicked}>
      <StockSearch
        className="w-full"
        onSelect={(t) => {
          setTicker(t.symbol);
          setStockName(t.description);
        }}
        clear={!ticker}
      />
      <Button
        disabled={!ticker || isPending}
        onClick={handleAnalyzeClicked}
        showLoading={isPending}
        className="flex-1/3 font-bold"
      >
        Analyze
      </Button>
    </form>
  );
}
