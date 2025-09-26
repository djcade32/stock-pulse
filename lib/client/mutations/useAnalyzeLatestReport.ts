import { ReportRowDTO } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAnalyzeLatestReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { ticker: string; name: string }) => {
      const res = await fetch("/api/reports/analyze-ticker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = "Analyze failed";
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json() as Promise<ReportRowDTO>;
    },
    onSuccess: () => {
      // refresh feed after analysis lands
      qc.invalidateQueries({ queryKey: ["reports-feed"] });
    },
  });
}
