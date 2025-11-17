"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Ellipsis, Trash2 } from "lucide-react";
import { ChartConfig, ChartContainer } from "./ui/chart";
import { ComposedChart, Line, Area } from "recharts";
import { cn, toKebabCase } from "@/lib/utils";
import DropdownMenu from "./general/DropdownMenu";
import useQuickChartStore from "@/stores/quick-chart-store";
import { db } from "@/firebase/client";
import { doc, setDoc } from "firebase/firestore";
import { useUid } from "@/hooks/useUid";
import { useIsMobile } from "@/hooks/use-mobile";

const chartConfig = {
  desktop: { label: "Desktop" },
  mobile: { label: "Mobile" },
} satisfies ChartConfig;

interface QuickChartProps {
  stock: {
    ticker: string;
    price: number;
    change: number; // parent computes intraday % change
  };
  deletable?: boolean;
  series?: { t: number; p: number }[]; // canonical intraday series (authoritative)
}

type ChartPoint = { time: number; desktop: number; delta: number };
const WINDOW = 120; // keep last N points so domain stays tight

function toChartData(series: { t: number; p: number }[]): ChartPoint[] {
  if (!series?.length) return [];
  const base = series[0].p;
  return series.map(({ t, p }) => ({
    time: t,
    desktop: p,
    delta: p - base,
  }));
}

const QuickChart = ({ stock, deletable = true, series }: QuickChartProps) => {
  const { removeFromQuickChartList, quickChartList } = useQuickChartStore();
  const { uid } = useUid();
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const isMobile = useIsMobile();

  const chartId = `quick-chart-${toKebabCase(stock.ticker)}`;
  const lineColor = stock.change >= 0 ? "var(--success-color)" : "var(--danger-color)";

  // Keep refs for base price and last timestamp so we can append smoothly
  const baseRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // 1) HYDRATE from authoritative series when it changes
  useEffect(() => {
    if (!series || series.length === 0) return;

    // If the incoming series is older than what we already have, or it looks like a new day, just replace.
    const incoming = toChartData(series);
    const incomingLastTime = incoming[incoming.length - 1].time;
    const currentLastTime = lastTimeRef.current;

    const shouldReplace =
      !currentLastTime ||
      !chartData.length ||
      incoming[0].time > (chartData[0]?.time ?? 0) || // new day or later start
      incomingLastTime >= (currentLastTime ?? 0); // server has progressed

    if (shouldReplace) {
      setChartData(incoming.slice(-WINDOW));
      baseRef.current = series[0].p;
      lastTimeRef.current = incomingLastTime;
    }
    // If not replacing, we keep local data (e.g., brief crossover), but generally server is canonical.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series?.length]); // depend on length so we don't thrash on same-length shallow changes

  // 2) APPEND from live price (between server writes)
  useEffect(() => {
    const now = Date.now();

    setChartData((prev) => {
      // Establish base if missing (e.g., no server series yet)
      let base = baseRef.current ?? (prev.length ? prev[0].desktop : stock.price);
      if (baseRef.current == null && prev.length === 0) {
        baseRef.current = base;
      }

      const lastTime = lastTimeRef.current ?? (prev.length ? prev[prev.length - 1].time : 0);

      // Avoid appending twice within the same millisecond window,
      // and avoid duplicates if server write already covered this instant.
      if (now <= lastTime) return prev;

      const next: ChartPoint = {
        time: now,
        desktop: stock.price,
        delta: stock.price - (base ?? stock.price),
      };

      const updated = [...prev, next].slice(-WINDOW);
      lastTimeRef.current = next.time;
      return updated;
    });
  }, [stock.price]);

  // Keep numeric display stable: prefer latest series price if provided, else stock.price
  const displayPrice = useMemo(() => {
    if (series?.length) return Number(series[series.length - 1].p.toFixed(2));
    return Number(stock.price.toFixed(2));
  }, [series, stock.price]);

  const handleRemove = async () => {
    const { ticker } = stock;
    removeFromQuickChartList(ticker);
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
        <p className={"text-(--secondary-text-color) font-semibold md:text-base text-sm"}>
          {stock.ticker}
        </p>
        <h2 className="text-xl md:text-2xl font-bold">{displayPrice}</h2>
        <div className="flex items-center">
          {stock.change >= 0 ? (
            <ArrowUp color="var(--success-color)" size={isMobile ? 14 : 16} />
          ) : (
            <ArrowDown color="var(--danger-color)" size={isMobile ? 14 : 16} />
          )}
          <p
            className={cn(
              "text-sm md:text-base",
              stock.change >= 0 ? "text-(--success-color)" : "text-(--danger-color)"
            )}
          >
            {stock.change}%
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center h-full">
        <ChartContainer
          config={chartConfig}
          className={cn("max-h-full w-full", isMobile && "flex items-center")}
        >
          <ComposedChart
            data={chartData}
            margin={isMobile ? { top: 35, right: 0, bottom: 35, left: 10 } : { left: 10 }}
          >
            <defs>
              <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Area first so the line renders on top */}
            <Area
              type="monotone"
              dataKey="delta"
              stroke="none"
              fill={`url(#${chartId})`}
              isAnimationActive
            />

            <Line
              type="monotone"
              dataKey="delta"
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
