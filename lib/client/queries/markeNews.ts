import { News } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFetchMarketNews() {
  return useQuery({
    queryKey: ["market-news-feed"],
    queryFn: async () => {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`Market news fetch failed`);
      const json = await res.json();
      return (json.data as any[]).filter((x) => !x.error) as News[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useRefreshMarketNews() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["market-news-feed"] });
}
