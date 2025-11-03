import { EarningsEvent, MacroEvent } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export function useFetchWatchlistEarnings(
  symbols: string[],
  dateRange: "this month" | "next week" | "this week" = "this month"
) {
  if (symbols.length === 0) {
    return useQuery({
      queryKey: ["watchlist-earnings", "empty"],
      queryFn: async () => {
        return [] as EarningsEvent[];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }
  let start: string;
  let end: string;

  const today = dayjs();

  if (dateRange === "this week") {
    start = today.startOf("week").format("YYYY-MM-DD");
    end = today.endOf("week").format("YYYY-MM-DD");
  } else if (dateRange === "next week") {
    start = today.add(1, "week").startOf("week").format("YYYY-MM-DD");
    end = today.add(1, "week").endOf("week").format("YYYY-MM-DD");
  } else {
    // this month
    start = today.startOf("month").format("YYYY-MM-DD");
    end = today.endOf("month").format("YYYY-MM-DD");
  }
  return useQuery({
    queryKey: ["watchlist-earnings", start, end],
    queryFn: async () => {
      const r = await fetch(
        `/api/watchlist/earnings?from=${start}&to=${end}&symbols=${symbols.join(",")}`,
        {
          cache: "no-store",
        }
      );
      if (!r.ok) throw new Error("Failed getting watchlist earnings");
      return (await r.json()).items as EarningsEvent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
