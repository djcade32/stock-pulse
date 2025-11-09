import { track } from "@/lib/analytics";
import { ReportRowDTO } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAnalyzeLatestReport() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { ticker: string; name: string }) => {
      toast.loading(`Analyzing ${payload.ticker}...`, {
        id: "analyze-latest-report",
      });

      const controller = new AbortController();
      const TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

      const timeoutId = setTimeout(() => {
        controller.abort(); // Cancel the request
      }, TIMEOUT_MS);

      const start = performance.now();

      let res: Response;
      try {
        res = await fetch("/api/reports/analyze-ticker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal, // Connect abort controller
        });
      } catch (err: any) {
        clearTimeout(timeoutId);

        // Handle TIMEOUT specifically
        if (err.name === "AbortError") {
          toast.error(`Analysis timed out after 2 minutes. Please try again.`, {
            id: "analyze-latest-report",
          });
          throw new Error("Request timed out after 2 minutes");
        }

        // Network or unexpected fetch error
        toast.error(`Network error while analyzing ${payload.ticker}`, {
          id: "analyze-latest-report",
        });
        throw err;
      }

      clearTimeout(timeoutId);

      const end = performance.now();
      const timeToGenerateMs = Math.round(end - start);

      if (!res.ok) {
        let msg = "Analyze failed";
        try {
          const j = await res.json();
          msg = j.error || msg;
        } catch {}
        toast.error(msg, { id: "analyze-latest-report" });
        throw new Error(msg);
      }

      // Track analytics
      track("generated_filing_summary", {
        ticker: payload.ticker,
        name: payload.name,
        time_to_generate_ms: timeToGenerateMs,
      });

      const ms = timeToGenerateMs;
      const secs = (ms / 1000).toFixed(2);
      const minutes = (ms / 60000).toFixed(2);

      console.log(
        `Generated analysis for ${payload.ticker} in ${ms} ms (${secs} s / ${minutes} min)`
      );

      toast.success(`Report analyzed for ${payload.ticker}`, {
        id: "analyze-latest-report",
      });

      return (await res.json()) as ReportRowDTO;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports-feed"] });
    },
  });
}
