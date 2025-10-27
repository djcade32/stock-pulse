import { NextResponse } from "next/server";
import {
  fetchQuote,
  getCache,
  setCache,
  isValidSymbol,
  normalizeSymbol,
} from "@/lib/server/quotes-core";

export const runtime = "nodejs";
export const revalidate = 0;

const TTL = 10_000;
const MAX_BATCH = 100;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("symbols") || "";
  if (!raw) return NextResponse.json({ error: "symbols required" }, { status: 400 });

  const unique = Array.from(new Set(raw.split(",").map(normalizeSymbol).filter(Boolean)));
  if (unique.length > MAX_BATCH)
    return NextResponse.json({ error: `Max ${MAX_BATCH}` }, { status: 400 });
  const invalid = unique.filter((s) => !isValidSymbol(s));
  if (invalid.length)
    return NextResponse.json({ error: `Invalid: ${invalid.join(", ")}` }, { status: 400 });

  const results = await Promise.all(
    unique.map(async (s) => {
      const key = `q:${s}`;
      const hit = getCache<any>(key);
      if (hit) return { symbol: s, data: hit, cached: true, error: null };
      try {
        const data = await fetchQuote(s);
        setCache(key, data, TTL);
        return { symbol: s, data, cached: false, error: null };
      } catch (e: any) {
        return { symbol: s, data: null, cached: false, error: String(e?.message || e) };
      }
    })
  );

  const map = results.reduce((acc, r) => {
    acc[r.symbol] = { data: r.data, cached: r.cached, error: r.error };
    return acc;
  }, {} as Record<string, { data: any; cached: boolean; error: string | null }>);

  return NextResponse.json(
    { count: unique.length, symbols: unique, quotes: map },
    {
      headers: { "cache-control": "s-maxage=10, stale-while-revalidate=20" },
    }
  );
}
