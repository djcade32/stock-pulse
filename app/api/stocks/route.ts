import { NextResponse } from "next/server";
import { fetchSymbolsUS, getCache, setCache } from "@/lib/server/quotes-core";

export const runtime = "nodejs";
export const revalidate = 0;
const TTL = 60_000; // symbols list can live longer than quotes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const limit = Math.min(200, Number(searchParams.get("limit") || 100));
  const cursor = searchParams.get("cursor") || "";

  const key = "symbols:US";
  const cached = getCache<any[]>(key);
  const data =
    cached ??
    (await fetchSymbolsUS().then((d: any[]) => {
      setCache(key, d, TTL);
      return d;
    }));

  const filtered = q
    ? data?.filter(
        (s) => s.symbol?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)
      )
    : data;

  if (!filtered) {
    return NextResponse.json(
      { data: [], cached: !!cached, nextCursor: null },
      {
        headers: { "cache-control": "s-maxage=60, stale-while-revalidate=120" },
      }
    );
  }
  const start = cursor ? Math.max(0, filtered.findIndex((r) => r.symbol === cursor) + 1) : 0;
  const slice = filtered.slice(start, start + limit);
  const nextCursor = slice.length === limit ? slice[limit - 1].symbol : null;

  return NextResponse.json(
    { data: slice, cached: !!cached, nextCursor },
    {
      headers: { "cache-control": "s-maxage=60, stale-while-revalidate=120" },
    }
  );
}
