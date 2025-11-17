import Button from "@/components/general/Button";
import LoaderComponent from "@/components/general/LoaderComponent";
import { Separator } from "@/components/ui/separator";
import { useFetchStockProfile } from "@/lib/client/hooks/useFetchStockProfile";
import { useAnalyzeLatestReport } from "@/lib/client/mutations/useAnalyzeLatestReport";
import { useReportsFeedInfinite } from "@/lib/client/queries/reports";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { FaMicrophoneAlt } from "react-icons/fa";
import { FaRobot } from "react-icons/fa6";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StockNextEarningsSectionProps {
  symbol: string;
}

const StockNextEarningsSection = ({ symbol }: StockNextEarningsSectionProps) => {
  const router = useRouter();
  const { data, isLoading } = useFetchStockProfile(symbol);
  const [yearFilter, setYearFilter] = useState<string | undefined>();
  const [quarterFilter, setQuarterFilter] = useState<string | undefined>();

  const nextEarningsDate = data?.next_earnings_date || null;
  const eps_surprise = data?.eps_surprise || null;

  const {
    data: earningsAnalysis,
    isLoading: loadingAnalyzedEarnings,
    refetch,
  } = useReportsFeedInfinite(30, symbol, yearFilter, quarterFilter);
  const rows = (earningsAnalysis?.pages ?? []).flatMap((p) => p.rows);
  const { mutate, isPending, error, data: analyzedEarning } = useAnalyzeLatestReport();

  useEffect(() => {
    if (eps_surprise && eps_surprise.length > 0) {
      setYearFilter(eps_surprise[0].year.toString());
      setQuarterFilter(`Q${eps_surprise[0].quarter}`);
    }
  }, [eps_surprise, symbol]);

  useEffect(() => {
    if (yearFilter && quarterFilter) {
      refetch();
    }
  }, [yearFilter, quarterFilter, symbol]);

  const convertEarningsHourToString = (hour: string) => {
    switch (hour) {
      case "bmo":
        return "Before Market Open";
      case "amc":
        return "After Market Close";
      case "dmh":
        return "During Market Hours";
      default:
        return "N/A";
    }
  };

  const handleAnalyzeClicked = () => {
    if (rows[0]) {
      const formattedDate = format(new Date(rows[0].date), "yyyy-MM-dd");
      router.push(`/earnings/${symbol}?q=${formattedDate}`);
    } else if (symbol && data?.name) {
      mutate({ ticker: symbol, name: data.name || symbol });
    }
  };

  return (
    <LoaderComponent
      height="13rem"
      width="100%"
      loading={isLoading || loadingAnalyzedEarnings}
      className="bg-(--secondary-color) px-6 py-4 rounded-lg"
      rounded="lg"
      loadingClassName="bg-(--secondary-color)"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-bold ">Next Earnings Call</h2>
        <FaMicrophoneAlt className="text-(--accent-color)" />
      </div>
      <div>
        <h2 className="font-bold text-xl md:text-2xl mt-2">
          {nextEarningsDate
            ? format(new Date(nextEarningsDate.date).toDateString(), "MMM dd, yyyy")
            : "N/A"}
        </h2>
        <p className="text-sm text-(--secondary-text-color)">{`Q${nextEarningsDate?.quarter} ${
          nextEarningsDate?.year
        } Results • ${convertEarningsHourToString(nextEarningsDate?.hour)}`}</p>
      </div>
      <Separator className="h-[2px] w-full bg-(--gray-accent-color) my-4" />
      {eps_surprise && (
        <div>
          <p className="text-sm text-(--secondary-text-color)">
            {`Last Quarter (Q${eps_surprise[0]?.quarter} ${eps_surprise[0]?.year})`}
          </p>
          <div className="flex items-end gap-2 justify-between mt-2">
            <div>
              <p className="text-sm text-(--secondary-text-color)">EPS Actual:</p>
              <p className="font-bold">${eps_surprise[0]?.actual.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-(--secondary-text-color)">EPS Estimate:</p>
              <p className="font-bold">${eps_surprise[0]?.estimate.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-(--secondary-text-color)">Surprise:</p>
              <p
                className={cn(
                  "font-bold",
                  eps_surprise[0]?.surprise > 0 && "text-(--success-color)",
                  eps_surprise[0]?.surprise < 0 && "text-(--danger-color)"
                )}
              >
                {eps_surprise[0]?.surprise > 0 && "+"}
                {eps_surprise[0]?.surprise.toFixed(2)} (
                {eps_surprise[0]?.surprisePercent > 0 && "+"}
                {eps_surprise[0]?.surprisePercent.toFixed(2)}%)
              </p>
            </div>
          </div>
          <Button
            className="w-full mt-4"
            onClick={handleAnalyzeClicked}
            disabled={isPending}
            showLoading={isPending}
          >
            <FaRobot />
            <p className="font-bold">
              {rows[0] ? "View AI Earnings Analysis" : "Analyze Latest Earnings"}
            </p>
          </Button>
        </div>
      )}
      {!eps_surprise && (
        <div>
          <p className="text-(--secondary-text-color)">No EPS surprise data available.</p>
        </div>
      )}
    </LoaderComponent>
  );
};

export default StockNextEarningsSection;
