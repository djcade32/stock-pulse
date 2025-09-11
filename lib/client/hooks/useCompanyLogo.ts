import { fetchCompanyLogo } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useCompanyLogo(symbol: string = "") {
  // Build a stable query key so TanStack Query cache is reliable.
  const queryKey = useMemo(() => ["companyLogo", symbol] as const, [symbol]);

  const query = useQuery({
    queryKey,
    // AbortController lets the request cancel if the component unmounts or the symbols change mid-flight.
    queryFn: async ({ signal }) => fetchCompanyLogo(symbol, signal),
  });

  return {
    /** TanStack Query extrass */
    url: query.data || { data: null, cached: false },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    /** Manual controls */
    refetch: query.refetch,
  };
}
