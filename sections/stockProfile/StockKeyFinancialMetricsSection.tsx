import StockProfileFinancialCard from "@/components/StockProfileFinancialCard";
import { useFetchStockProfile } from "@/lib/client/hooks/useFetchStockProfile";
import { formatUSD } from "@/lib/utils";
import React from "react";
import {
  FaWaveSquare,
  FaBuilding,
  FaCalculator,
  FaCoins,
  FaPercent,
  FaChartArea,
  FaChartColumn,
  FaDollarSign,
} from "react-icons/fa6";
interface StockKeyFinancialMetricsSectionProps {
  symbol: string;
}

const StockKeyFinancialMetricsSection = ({ symbol }: StockKeyFinancialMetricsSectionProps) => {
  const { data, isLoading, error } = useFetchStockProfile(symbol);
  const financials = data?.financials || {};

  const normalizeFinancials = (key: string) => {
    switch (key) {
      case "marketCapitalization":
        return "Market Cap";
      case "epsTTM":
        return "EPS (TTM)";
      case "peTTM":
        return "P/E Ratio";
      case "currentDividendYieldTTM":
        return "Dividend Yield";
      case "beta":
        return "Beta";
      case "52WeekHigh":
        return "52 Week High";
      case "52WeekLow":
        return "52 Week Low";
      case "3MonthAverageTradingVolume":
        return "Avg Volume (3M)";
      case "revenueTTM":
        return "Revenue (TTM)";
      default:
        return key;
    }
  };

  const normalizeFinancialValue = (key: string, value: number) => {
    switch (key) {
      case "marketCapitalization":
        return formatUSD(value);
      case "epsTTM":
        const symbol = value < 0 ? "-$" : "$";
        return `${symbol}${value.toFixed(2).replace("-", "")}`;
      case "peTTM":
        return value.toFixed(2);
      case "currentDividendYieldTTM":
        return `${value.toFixed(2)}%`;
      case "beta":
        return value.toFixed(2);
      case "52WeekHigh":
        return `$${value.toFixed(2)}`;
      case "52WeekLow":
        return `$${value.toFixed(2)}`;
      case "3MonthAverageTradingVolume":
        return formatUSD(value).replace("$", "");
      case "revenueTTM":
        return formatUSD(value);
      default:
        return value;
    }
  };

  const getFinancialIcon = (key: string) => {
    switch (key) {
      case "marketCapitalization":
        return FaBuilding;
      case "epsTTM":
        return FaCoins;
      case "peTTM":
        return FaCalculator;
      case "currentDividendYieldTTM":
        return FaPercent;
      case "beta":
        return FaWaveSquare;
      case "52WeekHigh":
        return FaChartArea;
      case "3MonthAverageTradingVolume":
        return FaChartColumn;
      case "revenueTTM":
        return FaDollarSign;
      default:
        return null;
    }
  };
  return (
    <div>
      <h2 className="text-xl font-bold ">Key Financial Statistics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        {Object.keys(financials).length > 0 ? (
          Object.keys(financials).map((key) => {
            if (key === "52WeekLow") return null;
            if (key === "52WeekHigh") {
              const value = `$${financials["52WeekLow"]?.toFixed(2)} - $${financials[
                "52WeekHigh"
              ]?.toFixed(2)}`;
              return (
                <StockProfileFinancialCard
                  key={key}
                  label="52 Week Range"
                  value={value}
                  icon={getFinancialIcon(key)}
                />
              );
            }

            return (
              <StockProfileFinancialCard
                key={key}
                label={normalizeFinancials(key)}
                value={financials[key] ? normalizeFinancialValue(key, financials[key]) : "—"}
                icon={getFinancialIcon(key)}
              />
            );
          })
        ) : isLoading ? (
          <>
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="w-full h-20 bg-(--secondary-color) rounded-lg animate-pulse"
              />
            ))}
          </>
        ) : (
          <p className="text-(--secondary-text-color)">No financial data available.</p>
        )}
      </div>
    </div>
  );
};

export default StockKeyFinancialMetricsSection;
