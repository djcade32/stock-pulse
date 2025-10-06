import { useQuery } from "@tanstack/react-query";

export function useFetchStockProfile(symbol: string) {
  return useQuery({
    queryKey: ["stock-profile", symbol],
    queryFn: async () => {
      const params = new URLSearchParams({ symbol });
      const res = await fetch(`/api/stock?${params}`);
      if (!res.ok) throw new Error(`Stock profile fetch failed`);
      const json = await res.json();
      console.log("Stock profile data:", json.data);
      return json.data as any;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours - how long data stays in cache after inactive
  });
}
