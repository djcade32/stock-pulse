import { getApiBaseUrl } from "@/lib/utils";
import { Stock } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type StockSymbolsResponse = {
  data: Stock[];
  cached: boolean;
};

/** Resolve the base URL of your REST proxy. */

/** Small fetch helper with abort + errors surfaced nicely. */
async function fetchStockSymbols(
  stock: string,
  signal?: AbortSignal
): Promise<StockSymbolsResponse> {
  const url = `/api/stocks?q=${stock}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Batch quotes request failed: ${response.status} ${response.statusText} ${text}`
    );
  }
  return response.json();
}

export function useStockSymbols(stock: string = "") {
  const normalizedStock = useMemo(() => {
    return (stock || "").trim().toUpperCase();
  }, [stock]);
  // Build a stable query key so TanStack Query cache is reliable.
  const queryKey = useMemo(() => ["stockSymbols", normalizedStock] as const, [normalizedStock]);

  const query = useQuery({
    queryKey,
    // AbortController lets the request cancel if the component unmounts or the symbols change mid-flight.
    queryFn: async ({ signal }) => fetchStockSymbols(normalizedStock, signal),
  });

  return {
    /** TanStack Query extras */
    stocks: query.data || { data: [], cached: false },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    /** Manual controls */
    refetch: query.refetch,
  };
}
