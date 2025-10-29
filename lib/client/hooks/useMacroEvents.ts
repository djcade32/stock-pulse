import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

export function useMacroEvents(monthISO: string) {
  const start = dayjs(monthISO).startOf("month").format("YYYY-MM-DD");
  const end = dayjs(monthISO).endOf("month").format("YYYY-MM-DD");

  return useQuery({
    queryKey: ["macro-events", start, end],
    queryFn: async () => {
      const r = await fetch(`/api/macro-events?from=${start}&to=${end}`, { cache: "no-store" });
      if (!r.ok) throw new Error("Failed getting macro events");
      return (await r.json()).items as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
