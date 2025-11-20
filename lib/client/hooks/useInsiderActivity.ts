"use client";

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { InsidersApiResponse } from "@/types";

export type InsiderQueryParams = {
  symbol: string;
  from?: string;
  to?: string;
};

async function fetchInsiderActivity({
  symbol,
  from,
  to,
}: InsiderQueryParams): Promise<InsidersApiResponse> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const queryString = params.toString();
  const url = `/api/insiders/${encodeURIComponent(symbol)}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[INSIDERS_API_ERROR]", res.status, text);
    throw new Error(
      res.status === 404 ? "No insider data found" : `Failed to load insider data (${res.status})`
    );
  }

  return (await res.json()) as InsidersApiResponse;
}

/**
 * Hook to load insider activity + sentiment for a symbol.
 *
 * Usage:
 * const { data, isLoading, isError, error } = useInsiderActivity({ symbol: 'TSLA' });
 */
export function useInsiderActivity<TData = InsidersApiResponse, TError = Error>(
  params: InsiderQueryParams,
  options?: Omit<UseQueryOptions<InsidersApiResponse, TError, TData>, "queryKey" | "queryFn">
) {
  const { symbol, from, to } = params;

  return useQuery<InsidersApiResponse, TError, TData>({
    queryKey: ["insiders", symbol.toUpperCase(), from ?? null, to ?? null],
    queryFn: () => fetchInsiderActivity({ symbol, from, to }),
    enabled: Boolean(symbol),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    ...options,
  });
}
