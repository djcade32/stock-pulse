import { NextResponse } from "next/server";
import {
  fetchLogo,
  getCache,
  setCache,
  isValidSymbol,
  normalizeSymbol,
} from "@/lib/server/quotes-core";

export const runtime = "nodejs";
export const revalidate = 300;
const TTL = 24 * 60 * 60 * 1000;

export async function GET(_: Request, context: { params: { ticker: string } }) {
  const t = normalizeSymbol(context.params.ticker);
  if (!isValidSymbol(t)) return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });

  const key = `logo:${t}`;
  const cached = getCache<string>(key);
  if (cached) return NextResponse.json({ data: cached, cached: true, symbol: t });

  const url = await fetchLogo(t);
  setCache(key, url, TTL);
  return NextResponse.json(
    { data: url, cached: false, symbol: t },
    {
      headers: { "cache-control": "s-maxage=86400, stale-while-revalidate=43200" },
    }
  );
}
