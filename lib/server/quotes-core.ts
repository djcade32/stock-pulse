import "server-only";
import Bottleneck from "bottleneck";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_KEY = process.env.FINNHUB_KEY!;
const LOGO_DEV_API_KEY = process.env.LOGO_DEV_API_KEY;

if (!FINNHUB_KEY) throw new Error("FINNHUB_KEY not set");

export const limiter = new Bottleneck({
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 60_000,
  minTime: 100,
});

// in-memory (per lambda instance) cache with TTL
type CacheRec<T> = { value: T; expiresAt: number };
const store = new Map<string, CacheRec<unknown>>();
export function setCache<T>(k: string, v: T, ttlMs: number) {
  store.set(k, { value: v, expiresAt: Date.now() + ttlMs });
}
export function getCache<T>(k: string): T | undefined {
  const rec = store.get(k);
  if (!rec) return;
  if (Date.now() > rec.expiresAt) {
    store.delete(k);
    return;
  }
  return rec.value as T;
}

export function normalizeSymbol(raw: string) {
  return (raw || "").trim().toUpperCase();
}
export function isValidSymbol(sym: string) {
  if (sym.startsWith("^")) return /^\^[A-Z.\-]+$/.test(sym);
  return /^[A-Z.\-]+$/.test(sym);
}

export async function fetchQuote(symbol: string) {
  const url = new URL(`${FINNHUB_BASE_URL}/quote`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", FINNHUB_KEY);
  return limiter.schedule(async () => {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`quote ${symbol}: ${r.status}`);
    return r.json();
  });
}

export async function fetchSymbolsUS() {
  const url = new URL(`${FINNHUB_BASE_URL}/stock/symbol`);
  url.searchParams.set("exchange", "US");
  url.searchParams.set("token", FINNHUB_KEY);
  return limiter.schedule(async () => {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`symbols: ${r.status}`);
    return r.json();
  });
}

export async function fetchLogo(ticker: string) {
  if (!LOGO_DEV_API_KEY) throw new Error("LOGO_DEV_API_KEY not set");
  const r = await fetch(
    `https://img.logo.dev/ticker/${ticker}?token=${LOGO_DEV_API_KEY}&format=png`,
    { cache: "force-cache" }
  );
  if (!r.ok) throw new Error(`logo ${ticker}: ${r.status}`);
  return r.url;
}

type Q = { symbol: string; last: number };

export async function getQuotes(symbols: string[]): Promise<Q[]> {
  // Simple REST “quote” endpoint; one call per symbol (free-tier friendly)
  // If you want tighter batching, you can parallelize and/or add minimal delay.
  const out: Q[] = [];
  await Promise.all(
    symbols.map(async (s) => {
      const res = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(s)}&token=${FINNHUB_KEY}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(`Finnhub ${s} ${res.status}`);
      const j = await res.json();
      // j.c = current/last price
      out.push({ symbol: s, last: Number(j?.c ?? 0) });
    })
  );
  return out;
}
