import { ReportRowDTO } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useReportsFeed() {
  console.log("Fetching reports feed...");
  return useQuery<ReportRowDTO[]>({
    queryKey: ["reports-feed"],
    queryFn: async () => {
      const res = await fetch("/api/reports/feed", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load reports feed");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useRefreshReports() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["reports-feed"] });
}
