// lib/client/hooks/useCandles.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

type CandleResponse = {
  c: number[]; // close
  h: number[]; // high
  l: number[]; // low
  o: number[]; // open
  s: string; // "ok" | "no_data"
  t: number[]; // timestamps (unix seconds)
  v: number[]; // volume
};

/** Our proxy wraps it in { data, cached, symbol, resolution } */
type ProxyCandleResponse = {
  data: CandleResponse;
  cached: boolean;
  symbol: string;
  resolution: string;
};

/** Return type: list of candle objects */
export type Candle = {
  time: number; // ms since epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/** Build API base URL */
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";
}

/**
 * Hook: fetch candles for a symbol and resolution between from-to.
 *
 * @param symbol e.g. "AAPL"
 * @param resolution e.g. "1" (1-min), "5", "60", "D"
 * @param from Unix seconds (start)
 * @param to Unix seconds (end)
 */
export function useCandles(symbol: string, resolution: string, from: number, to: number) {
  const normalizedSymbol = (symbol || "").trim().toUpperCase();

  // Query key is stable so caching works
  const queryKey = useMemo(
    () => ["candles", normalizedSymbol, resolution, from, to] as const,
    [normalizedSymbol, resolution, from, to]
  );

  // Pick defaults: intraday refresh shorter, daily refresh longer
  const isDaily = resolution.toUpperCase() === "D";
  const staleTime = isDaily ? 60 * 60 * 1000 : 30_000; // 1h vs 30s
  const refetchInterval = isDaily ? false : 30_000; // intraday only

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const base = getApiBaseUrl();
      const url = `${base}/api/candles?symbol=${normalizedSymbol}&resolution=${resolution}&from=${from}&to=${to}`;
      const res = await fetch(url, { signal });
      if (!res.ok) throw new Error(`Candles failed: ${res.status}`);
      const raw: ProxyCandleResponse = await res.json();

      const arr: Candle[] = [];
      const d = raw.data;
      if (d?.s === "ok") {
        for (let i = 0; i < d.t.length; i++) {
          arr.push({
            time: d.t[i] * 1000, // convert to ms
            open: d.o[i],
            high: d.h[i],
            low: d.l[i],
            close: d.c[i],
            volume: d.v[i],
          });
        }
      }
      return arr;
    },
    enabled: !!normalizedSymbol && !!from && !!to,
    staleTime,
    refetchInterval,
    retry: 1,
  });

  return {
    candles: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
