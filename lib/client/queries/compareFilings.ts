import { track } from "@/lib/analytics";
import { CompareFilingsAIResult, ReportRowDTO } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
      const controller = new AbortController();
      const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

      const timeoutId = setTimeout(() => {
        controller.abort(); // Cancel the request
      }, TIMEOUT_MS);

      const start = performance.now();

      let res: Response;
      try {
        res = await fetch("/api/reports/compare-filings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urlA, urlB }),
        });
      } catch (err: any) {
        clearTimeout(timeoutId);

        // Handle TIMEOUT specifically
        if (err.name === "AbortError") {
          toast.error(`Comparison timed out after 2 minutes. Please try again.`);
          throw new Error("Request timed out after 2 minutes");
        }

        // Network or unexpected fetch error
        toast.error(`Network error while comparing filings.`);
        throw err;
      }
      clearTimeout(timeoutId);
      const end = performance.now();
      const timeToGenerateMs = Math.round(end - start);

      if (!res.ok) {
        let msg = "Comparison failed";
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {}
        toast.error(msg);
        throw new Error(msg);
      }

      // Track analytics
      track("ran_comparison_mode", {
        tickerA: stockA,
        tickerB: stockB,
        time_to_generate_ms: timeToGenerateMs,
      });

      const ms = timeToGenerateMs;
      const secs = (ms / 1000).toFixed(2);
      const minutes = (ms / 60000).toFixed(2);

      console.log(
        `Generated comparison for ${stockA} vs ${stockB} in ${ms} ms (${secs} s / ${minutes} min)`
      );

      return res.json() as Promise<CompareFilingsAIResult>;
    },
    enabled: !!stockA && !!dateA && !!stockB && !!dateB && enabled,
  });
}
