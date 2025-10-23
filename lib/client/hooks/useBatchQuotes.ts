// lib/client/hooks/useBatchQuotes.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { isUsMarketOpen } from "@/lib/utils";

/** Shape of a single quote as Finnhub returns it (simplified). */
export type FinnhubQuote = {
  c: number; // current price
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp (seconds)
  dp: number; // change percentage
};

/** Shape of our proxy batch response. */
type BatchQuotesResponse = {
  count: number;
  symbols: string[];
  quotes: Record<
    string,
    {
      data: FinnhubQuote | null;
      cached: boolean;
      error: string | null;
    }
  >;
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
async function fetchBatchQuotes(
  symbols: string[],
  signal?: AbortSignal
): Promise<BatchQuotesResponse> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams({ symbols: symbols.join(",") });
  const url = `${baseUrl}/api/quotes?${params.toString()}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Batch quotes request failed: ${response.status} ${response.statusText} ${text}`
    );
  }
  return response.json();
}

/**
 * React hook: fetch many quotes at once and keep them fresh.
 *
 * @param inputSymbols e.g. ["AAPL", "MSFT", "TSLA"]
 * @param options optional override timings and enabled flag
 */
export function useBatchQuotes(
  inputSymbols: string[],
  options?: {
    /** If false, the hook will not fetch. */
    enabled?: boolean;
    /** How often to refresh during market hours (ms). Default 5s. */
    marketRefetchMs?: number;
    /** How often to refresh after hours (ms). Default 60s. */
    afterHoursRefetchMs?: number;
  }
) {
  const enabled = options?.enabled ?? true;
  const marketRefetchMs = options?.marketRefetchMs ?? 5_000;
  const afterHoursRefetchMs = options?.afterHoursRefetchMs ?? 60_000;

  // Normalize symbols: trim, uppercase, de-duplicate, and sort for stable query keys.
  const normalizedSymbols = useMemo(() => {
    const unique = Array.from(
      new Set(
        (inputSymbols || []).map((symbol) => (symbol || "").trim().toUpperCase()).filter(Boolean)
      )
    );
    unique.sort(); // stable key
    return unique;
  }, [inputSymbols]);

  const shouldFetch = enabled && normalizedSymbols.length > 0;

  // Build a stable query key so TanStack Query cache is reliable.
  const queryKey = useMemo(() => ["batchQuotes", normalizedSymbols] as const, [normalizedSymbols]);

  // Decide refetch cadence based on a quick market-open check.
  const refetchInterval = isUsMarketOpen() ? marketRefetchMs : afterHoursRefetchMs;

  const query = useQuery({
    queryKey,
    enabled: shouldFetch,
    // AbortController lets the request cancel if the component unmounts or the symbols change mid-flight.
    queryFn: async ({ signal }) => fetchBatchQuotes(normalizedSymbols, signal),
    // Quotes change fast; consider them stale quickly so UI is ok refetching when focused.
    staleTime: 1_000,
    refetchInterval,
    refetchOnWindowFocus: true, // set true if you like "jump to live" when tab refocuses
    retry: 2,
    refetchIntervalInBackground: true,
    // Optional: Transform into a friendlier shape for UI consumption.
    select: (
      raw
    ): {
      bySymbol: Record<string, FinnhubQuote | null>;
      errors: Record<string, string>;
      raw: BatchQuotesResponse;
    } => {
      const bySymbol: Record<string, FinnhubQuote | null> = {};
      const errors: Record<string, string> = {};
      for (const symbol of raw.symbols) {
        const entry = raw.quotes[symbol];
        bySymbol[symbol] = entry?.data ?? null;
        if (entry?.error) errors[symbol] = entry.error;
      }
      return { bySymbol, errors, raw };
    },
  });

  return {
    /** Map of SYMBOL -> FinnhubQuote (or null if failed) */
    quotesBySymbol: query.data?.bySymbol ?? {},
    /** Map of SYMBOL -> error message (only for failed symbols) */
    errorsBySymbol: query.data?.errors ?? {},
    /** Raw response (if you need cached flags, counts, etc.) */
    raw: query.data?.raw,
    /** TanStack Query extras */
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    /** Manual controls */
    refetch: query.refetch,
  };
}
