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

export async function GET(_: Request, { params }: { params: { symbol: string } }) {
  const sym = normalizeSymbol(params.symbol);
  if (!isValidSymbol(sym)) return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });

  const key = `q:${sym}`;
  const cached = getCache<any>(key);
  if (cached) return NextResponse.json({ data: cached, cached: true, symbol: sym });

  const data = await fetchQuote(sym);
  setCache(key, data, TTL);
  return NextResponse.json(
    { data, cached: false, symbol: sym },
    {
      headers: { "cache-control": "s-maxage=10, stale-while-revalidate=20" },
    }
  );
}
