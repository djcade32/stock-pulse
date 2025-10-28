import { useQuery } from "@tanstack/react-query";
import { getMarketStatus, MarketStatus } from "../queries/getMarketStatus";

export function useMarketStatus() {
  return useQuery<MarketStatus>({
    queryKey: ["market-status"],
    queryFn: getMarketStatus,
    staleTime: 30_000, // treat as fresh for 30s
    refetchInterval: 60_000, // poll every minute
    refetchOnWindowFocus: true, // gets fresh after tab switch
  });
}
