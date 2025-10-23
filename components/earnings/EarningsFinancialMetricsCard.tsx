import { formatNumber, formatToUSD } from "@/lib/utils";
import { KPI } from "@/types";
import React from "react";

interface FinancialMetricsCardProps {
  kpi: KPI;
}

const FinancialMetricsCard = ({ kpi }: FinancialMetricsCardProps) => {
  const { name, value, unit, yoyDelta, qoqDelta } = kpi;
  return (
    <div className="bg-(--background) rounded-lg p-2 flex flex-col gap-1">
      <h3 className="font-bold">{name}</h3>
      <p className="text-(--secondary-text-color)">
        {unit?.includes("USD") ? formatToUSD(parseInt(value)) : formatNumber(parseInt(value))}{" "}
        {unit}
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
