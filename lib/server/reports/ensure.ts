import { analyzeLatestReportForTicker } from "@/lib/server/reports/analyzeLatest";
import { WatchlistStock } from "@/types";

// run small concurrency, stop if time is nearly up (avoid Vercel 60s)
export async function ensureTickersLatest(
  stocks: WatchlistStock[],
  opts: { concurrency?: number; softTimeoutMs?: number } = {}
) {
  const started = Date.now();
  const CONCURRENCY = opts.concurrency ?? 2;
  const SOFT_TIMEOUT_MS = opts.softTimeoutMs ?? 50_000;

  const queue = stocks;
  const results: Array<{ ticker: string; eventId?: string; deduped?: boolean; error?: string }> =
    [];

  const timeLeft = () => SOFT_TIMEOUT_MS - (Date.now() - started);

  const worker = async () => {
    while (queue.length) {
      if (timeLeft() <= 0) return;
      const ticker = queue.shift()!;
      try {
        const analyzed = await analyzeLatestReportForTicker(ticker);
        results.push({
          ticker: ticker.symbol,
          eventId: analyzed.eventId,
          deduped: analyzed.deduped,
        });
      } catch (e: any) {
        results.push({ ticker: ticker.symbol, error: e?.message || "failed" });
      }
    }
  };

  await Promise.allSettled(Array.from({ length: CONCURRENCY }, () => worker()));
  const partial = timeLeft() <= 0 && queue.length > 0;
  return { results, partial };
}
