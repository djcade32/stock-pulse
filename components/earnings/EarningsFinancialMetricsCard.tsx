import { formatNumber, formatToUSD } from "@/lib/utils";
import { KPI } from "@/types";
import React from "react";

interface FinancialMetricsCardProps {
  kpi: KPI;
}

const FinancialMetricsCard = ({ kpi }: FinancialMetricsCardProps) => {
  const { name, value, unit, yoyDelta, qoqDelta } = kpi;
  // Remove $ and parenthesis from value if present
  const cleanValue = value.replace(/[\$,()]/g, "");
  return (
    <div className="bg-(--background) rounded-lg p-2 flex flex-col gap-1 justify-between">
      <h3 className="font-bold text-xs md:text-base">{name}</h3>
      <p className="text-(--secondary-text-color) text-xs md:text-base">
        {unit?.includes("USD")
          ? formatToUSD(parseInt(cleanValue))
          : formatNumber(parseInt(cleanValue))}
        {unit === "percent" ? "%" : ` ${unit}`}
      </p>
      <div className="flex gap-2">
        {yoyDelta && (
          <p
            className={`text-sm ${
              parseInt(yoyDelta) > 0 ? "text-(--success-color)" : "text-(--danger-color)"
            }`}
          >
            YoY: {yoyDelta}
          </p>
        )}
        {qoqDelta && (
          <p
            className={`text-sm ${
              parseInt(qoqDelta) > 0 ? "text-(--success-color)" : "text-(--danger-color)"
            }`}
          >
            QoQ: {qoqDelta}
          </p>
        )}
      </div>
    </div>
  );
};

export default FinancialMetricsCard;
