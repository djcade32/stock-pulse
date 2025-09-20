import { News } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFetchCompanyNews(symbol: string) {
  console.log("Fetching company news for ", symbol);
  return useQuery({
    queryKey: ["company-news", symbol],
    queryFn: async () => {
      const params = new URLSearchParams({ symbol });
      const res = await fetch(`/api/news/company?${params}`);
      if (!res.ok) throw new Error(`Company news fetch failed`);
      const json = await res.json();
      console.log("Company news response: ", json.data);
      return (json.data as any[]).filter((x) => !x.error) as News[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useRefreshCompanyNews(symbol: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["company-news", symbol] });
}
