// app/api/quote/[symbol]/route.ts
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

export async function GET(req: Request, context: { params: Record<string, string> }) {
  const symbol = normalizeSymbol(context.params.symbol);
  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
  }

  const key = `q:${symbol}`;
  const cached = getCache<any>(key);
  if (cached) {
    return NextResponse.json({ data: cached, cached: true, symbol });
  }

  const data = await fetchQuote(symbol);
  setCache(key, data, TTL);

  return NextResponse.json(
    { data, cached: false, symbol },
    { headers: { "cache-control": "s-maxage=10, stale-while-revalidate=20" } }
  );
}
