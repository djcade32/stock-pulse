import { MacroEvent } from "@/types";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export function useMacroEvents(
  dateRange: "today" | "this month" | "next week" | "this week" = "this month"
) {
  let start: string;
  let end: string;

  const today = dayjs();
  if (dateRange === "today") {
    start = today.format("YYYY-MM-DD");
    end = today.format("YYYY-MM-DD");
  } else if (dateRange === "this week") {
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
    queryKey: ["macro-events", start, end],
    queryFn: async () => {
      const r = await fetch(`/api/macro-events?from=${start}&to=${end}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed getting macro events");
      return (await r.json()).items as MacroEvent[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
