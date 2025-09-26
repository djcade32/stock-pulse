import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAnalyzeFilingUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      url: string;
      ticker: string;
      formLabel?: string;
      name?: string;
    }) => {
      const res = await fetch("/api/reports/analyze-url", {
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
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports-feed"] }),
  });
}
