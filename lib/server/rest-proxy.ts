// lib/server/rest-proxy.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Bottleneck from "bottleneck";

// === Basic configuration ===
const SERVER_PORT = Number(process.env.PORT || 8080);
const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.FINNHUB_KEY;

// Cache times (quotes change fast; keep this tiny)
const QUOTE_CACHE_TTL_MS = 2_000; // 2 seconds

// Safety check for API key
if (!FINNHUB_API_KEY) {
  console.error("❌ Missing FINNHUB_KEY. Set it in your .env or environment.");
  process.exit(1);
}

// === Simple in-memory cache with TTL ===
type CacheRecord<T> = { value: T; expiresAt: number };
const cacheStore = new Map<string, CacheRecord<unknown>>();

function setCache<T>(key: string, value: T, ttlMs: number): void {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getCache<T>(key: string): T | undefined {
  const record = cacheStore.get(key);
  if (!record) return undefined;
  if (Date.now() > record.expiresAt) {
    cacheStore.delete(key);
    return undefined;
  }
  return record.value as T;
}

// === Rate limiter to respect Finnhub 60 req/min ===
const providerLimiter = new Bottleneck({
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 60_000,
  minTime: 100,
});

// === Small helpers ===
function normalizeSymbol(raw: string): string {
  return (raw || "").trim().toUpperCase();
}

function isValidSymbol(symbol: string): boolean {
  // Keep this simple; expand if you support more exotic tickers.
  return /^[A-Z.\-]+$/.test(symbol);
}

async function fetchQuoteFromProvider(symbol: string): Promise<unknown> {
  const providerUrl = new URL(`${FINNHUB_BASE_URL}/quote`);
  providerUrl.searchParams.set("symbol", symbol);
  providerUrl.searchParams.set("token", FINNHUB_API_KEY as string);

  return providerLimiter.schedule(async () => {
    const providerResponse = await fetch(providerUrl);
    if (!providerResponse.ok) {
      const bodyText = await providerResponse.text().catch(() => "");
      throw new Error(
        `Finnhub quote failed: ${providerResponse.status} ${providerResponse.statusText} ${bodyText}`
      );
    }
    return providerResponse.json();
  });
}

async function getQuoteWithCache(symbol: string): Promise<{ data: unknown; fromCache: boolean }> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCache<unknown>(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  const fresh = await fetchQuoteFromProvider(symbol);
  setCache(cacheKey, fresh, QUOTE_CACHE_TTL_MS);
  return { data: fresh, fromCache: false };
}

// === Express app ===
const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "stock-pulse-rest-proxy" });
});

/**
 * GET /api/quote/:symbol
 * Example: /api/quote/AAPL
 */
app.get("/api/quote/:symbol", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const symbol = normalizeSymbol(request.params.symbol);
    if (!isValidSymbol(symbol)) {
      response.status(400).json({ error: "Invalid symbol format." });
      return;
    }

    const { data, fromCache } = await getQuoteWithCache(symbol);
    response.json({ data, cached: fromCache, symbol });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/quotes?symbols=AAPL,MSFT,TSLA
 *
 * - Accepts a comma-separated list of symbols in the "symbols" query param.
 * - Validates and de-duplicates symbols.
 * - Reuses the same cache as the single-quote endpoint.
 * - Runs provider calls in parallel but still obeys the rate limiter.
 * - Returns an object keyed by symbol.
 */
app.get("/api/quotes", async (request: Request, response: Response, next: NextFunction) => {
  try {
    const rawSymbols = String(request.query.symbols || "");
    if (!rawSymbols) {
      response.status(400).json({ error: "Query param 'symbols' is required." });
      return;
    }

    // Parse, normalize, validate, and de-duplicate
    const symbolList = rawSymbols.split(",").map(normalizeSymbol).filter(Boolean);

    const uniqueSymbols = Array.from(new Set(symbolList));
    const invalid = uniqueSymbols.filter((s) => !isValidSymbol(s));
    if (invalid.length > 0) {
      response.status(400).json({ error: `Invalid symbols: ${invalid.join(", ")}` });
      return;
    }

    // Optional: protect against very large batches (you can tune this)
    const MAX_BATCH = 100;
    if (uniqueSymbols.length > MAX_BATCH) {
      response.status(400).json({ error: `Too many symbols. Max allowed is ${MAX_BATCH}.` });
      return;
    }

    // Fetch all, reusing cache per symbol
    const results = await Promise.all(
      uniqueSymbols.map(async (symbol) => {
        try {
          const { data, fromCache } = await getQuoteWithCache(symbol);
          return { symbol, data, cached: fromCache, error: null };
        } catch (error) {
          // Capture errors per symbol (don’t fail the whole batch)
          return { symbol, data: null, cached: false, error: String(error) };
        }
      })
    );

    // Build response map keyed by symbol
    const bySymbol: Record<
      string,
      { data: unknown | null; cached: boolean; error: string | null }
    > = {};
    for (const item of results) {
      bySymbol[item.symbol] = {
        data: item.data,
        cached: item.cached,
        error: item.error,
      };
    }

    response.json({
      count: uniqueSymbols.length,
      symbols: uniqueSymbols,
      quotes: bySymbol,
    });
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("REST proxy error:", error);
    res.status(502).json({
      error: "Upstream or server error. See server logs for details.",
    });
  }
);

// Start server
app.listen(SERVER_PORT, () => {
  console.log(
    `✅ REST proxy listening on http://localhost:${SERVER_PORT}\n` +
      `   Single: GET /api/quote/:symbol\n` +
      `   Batch : GET /api/quotes?symbols=AAPL,MSFT,TSLA`
  );
});
