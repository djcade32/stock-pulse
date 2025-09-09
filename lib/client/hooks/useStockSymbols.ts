import { Stock } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type StockSymbolsResponse = {
  data: Stock[];
  cached: boolean;
};

/** Resolve the base URL of your REST proxy. */
function getApiBaseUrl(): string {
  // Prefer env var so production can point to Railway/Fly/etc.
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  // Dev fallback
  return "http://localhost:8080";
}

/** Small fetch helper with abort + errors surfaced nicely. */
async function fetchStockSymbols(
  stock: string,
  signal?: AbortSignal
): Promise<StockSymbolsResponse> {
  console.log("fetchStockSymbols called");
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/stocks?q=${stock}`;

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
