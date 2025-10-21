"use client";

import React, { useEffect, useMemo } from "react";
import { ArrowDown, ArrowUp, Ellipsis, Trash2 } from "lucide-react";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { ComposedChart, Line, Area } from "recharts";
import { toKebabCase } from "@/lib/utils";
import { useCandles } from "@/lib/client/hooks/useCandles";
import DropdownMenu from "./general/DropdownMenu";
import useQuickChartStore from "@/stores/quick-chart-store";
import { db } from "@/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useUid } from "@/hooks/useUid";
import { set } from "date-fns";

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
  deletable?: boolean;
}

const QuickChart = ({ stock, deletable = true }: QuickChartProps) => {
  const { removeFromQuickChartList, quickChartList } = useQuickChartStore();
  const { uid } = useUid();
  const [chartData, setChartData] = React.useState<{ time: number; desktop: number }[]>([]);
  const chartId = `quick-chart-${toKebabCase(stock.ticker)}`;
  const lineColor = stock.change >= 0 ? "var(--success-color)" : "var(--danger-color)";

  useEffect(() => {
    setChartData((prev) => [...prev, { time: Date.now(), desktop: stock.price }]);
    console.log("Updated chart data for", stock.ticker, chartData);
  }, [stock.price]);

  const handleRemove = async () => {
    const { ticker } = stock;
    // Implement the logic to remove the stock from the quick chart
    console.log(`Removing ${ticker} from quick chart`);
    removeFromQuickChartList(ticker);
    // Remove from firebase as well
    const ref = doc(db, "quickCharts", uid!);
    await setDoc(
      ref,
      {
        uid,
        symbols: quickChartList.filter((s) => s !== ticker),
      },
      { merge: true }
    );
  };

  return (
    <div className="group card h-[100px]">
      {deletable && (
        <DropdownMenu
          className="w-10 bg-(--secondary-color) shadow-lg border border-(--gray-accent-color)"
          renderTrigger={
            <Ellipsis className="absolute top-0 right-4 text-(--secondary-text-color) opacity-0 group-hover:opacity-100 hover:brightness-125 cursor-pointer smooth-animation" />
          }
          items={[
            {
              icon: <Trash2 size={12} color="var(--danger-color" />,
              label: "Remove",
              onClick: handleRemove,
            },
          ]}
          side="right"
        />
      )}
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
