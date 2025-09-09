"use client";

import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { ComposedChart, Line, Area } from "recharts";
import { toKebabCase } from "@/lib/utils";
import { useCandles } from "@/lib/client/hooks/useCandles";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
} satisfies ChartConfig;

interface QuickChartProps {
  stock: {
    ticker: string;
    price: number;
    change: number;
  };
}

const QuickChart = ({ stock }: QuickChartProps) => {
  const chartId = `quick-chart-${toKebabCase(stock.ticker)}`;
  const lineColor = stock.change >= 0 ? "var(--success-color)" : "var(--danger-color)";

  return (
    <div className="card h-[100px]">
      <div className="flex flex-col items-start justify-center gap-[0.5]">
        <p className="text-(--secondary-text-color) font-semibold">{stock.ticker}</p>
        <h2 className="text-2xl font-bold">{stock.price}</h2>
        <div className="flex items-center">
          {stock.change >= 0 ? (
            <ArrowUp color="var(--success-color)" />
          ) : (
            <ArrowDown color="var(--danger-color)" />
          )}
          <p className={stock.change >= 0 ? "text-(--success-color)" : "text-(--danger-color)"}>
            {stock.change}%
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center h-full">
        <ChartContainer config={chartConfig} className="max-h-full w-full">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Area first so the line renders on top */}
            <Area
              type="monotone"
              dataKey="desktop"
              stroke="none"
              fill={`url(#${chartId})`}
              isAnimationActive
            />

            <Line
              type="monotone"
              dataKey="desktop"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          </ComposedChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export default QuickChart;
