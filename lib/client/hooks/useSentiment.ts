import { useQuery } from "@tanstack/react-query";

export type TickerSentiment = {
  ticker: string;
  score: number; // 0..100
  counts: { positive: number; neutral: number; negative: number };
  tags: Array<{ tag: string; sentiment: "Positive" | "Neutral" | "Negative"; count: number }>;
  summary: string;
  numOfNews: number;
};

export function useSentiment(tickers: string[], opts?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["sentiment", ...tickers],
    queryFn: async () => {
      const qs = new URLSearchParams({ tickers: tickers.join(",") });
      const res = await fetch(`/api/sentiment?${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Sentiment fetch failed`);
      const json = await res.json();
      return (json.data as any[]).filter((x) => !x.error) as TickerSentiment[];
    },
    enabled: (opts?.enabled ?? true) && tickers.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}
