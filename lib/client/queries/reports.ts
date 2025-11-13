import { ReportRowDTO } from "@/types";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";

type FeedPage = { rows: ReportRowDTO[]; nextCursor?: string | null; hasMore: boolean };

export function useReportsFeed(limit = 30, cursor?: string | null) {
  return useQuery<FeedPage>({
    queryKey: ["reports-feed", { limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/reports/feed?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load reports feed");
      return res.json();
    },
    staleTime: 60_000, // make fresher if you like
  });
}

export function useRefreshReports(limit = 30) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["reports-feed", { limit }] });
}

async function fetchFeedPage(
  limit: number,
  cursor?: string | null,
  stock?: string | null,
  year?: string | null,
  quarter?: string | null
): Promise<FeedPage> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (stock) params.set("stock", stock);
  if (year) params.set("year", year);
  if (quarter) params.set("quarter", quarter);
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/reports/feed?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load reports feed");
  return res.json();
}

export function useReportsFeedInfinite(
  limit = 30,
  stock?: string,
  year?: string,
  quarter?: string,
  search?: boolean,
  enabled = true
) {
  let key = stock ? "reports-feed-infinite-" + stock : "reports-feed-infinite";
  if (search) {
    key = "reports-feed-infinite-search-" + stock;
  }
  return useInfiniteQuery<FeedPage>({
    queryKey: [key, { limit }],
    queryFn: ({ pageParam }) => {
      const cursor = typeof pageParam === "string" ? pageParam : null;
      return fetchFeedPage(limit, cursor, stock, year, quarter);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 60_000,
    enabled: enabled,
  });
}

export function useRefreshReportsInfinite(limit = 30) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["reports-feed-infinite", { limit }] });
}
