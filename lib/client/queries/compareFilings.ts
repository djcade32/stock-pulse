import { CompareFilingsAIResult, ReportRowDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCompareFilings(
  reportA: ReportRowDTO | null,
  reportB: ReportRowDTO | null,
  enabled = true
) {
  const stockA = reportA?.ticker || "";
  const dateA = reportA?.date || "";
  const urlA = reportA?.url || "";
  const stockB = reportB?.ticker || "";
  const dateB = reportB?.date || "";
  const urlB = reportB?.url || "";
  return useQuery({
    queryKey: ["compare-filings", stockA, dateA, stockB, dateB],
    queryFn: async () => {
      const res = await fetch("/api/reports/compare-filings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlA, urlB }),
      });
      if (!res.ok) throw new Error("Failed to compare filings");
      return res.json() as Promise<CompareFilingsAIResult>;
    },
    enabled: !!stockA && !!dateA && !!stockB && !!dateB && enabled,
  });
}
