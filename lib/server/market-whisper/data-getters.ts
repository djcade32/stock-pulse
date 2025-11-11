import { MacroEvent, WatchlistCard } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import yahooFinance from "yahoo-finance2";
import YahooFinance from "yahoo-finance2";
import { getApiBaseUrl } from "@/lib/utils";

dayjs.extend(utc);
dayjs.extend(tz);

const url = getApiBaseUrl();

export async function getTodayMacroEvents(): Promise<MacroEvent[]> {
  const now = dayjs().tz("America/New_York");
  const start = now.startOf("day").format("YYYY-MM-DD");
  const end = now.endOf("day").format("YYYY-MM-DD");
  try {
    const r = await fetch(`${url}/api/macro-events?from=${start}&to=${end}`, { cache: "no-store" });
    if (!r.ok) throw new Error("Failed getting macro events");
    return (await r.json()).items as MacroEvent[];
  } catch (error) {
    console.error("Error fetching today's macro events:", error);
    return [];
  }
}

type FuturesTone = {
  spy: "up" | "down" | "flat";
  qqq: "up" | "down" | "flat";
  overall: "risk-on" | "risk-off" | "mixed";
  debug?: { spyPct?: number; qqqPct?: number; usedField?: string };
};

const PM_THRESHOLD = 0.2; // +/-0.2% is considered "flat"

/**
 * Uses yahoo-finance2 to get SPY and QQQ premarket % changes.
 * Falls back to regular market % change if premarket data isn't available.
 */
export async function getPremarketFuturesTone(): Promise<FuturesTone> {
  try {
    // yahoo-finance2 allows batch queries
    const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
    const results = yf.quote(["SPY", "QQQ"]);

    const getChange = (data: any) => {
      // prefer premarket change percent if available
      const pre =
        typeof data?.preMarketChangePercent === "number" ? data.preMarketChangePercent : undefined;
      const reg =
        typeof data?.regularMarketChangePercent === "number"
          ? data.regularMarketChangePercent
          : undefined;
      const pct = pre ?? reg;
      const usedField = pre != null ? "pre" : "regular";
      return { pct, usedField };
    };

    const [spyData, qqqData] = await results;
    const spy = getChange(spyData);
    const qqq = getChange(qqqData);

    const classify = (pct?: number): "up" | "down" | "flat" => {
      if (pct == null) return "flat";
      if (pct > PM_THRESHOLD) return "up";
      if (pct < -PM_THRESHOLD) return "down";
      return "flat";
    };

    const spyTone = classify(spy.pct);
    const qqqTone = classify(qqq.pct);

    const overall =
      spyTone === "up" && qqqTone === "up"
        ? "risk-on"
        : spyTone === "down" && qqqTone === "down"
        ? "risk-off"
        : "mixed";

    return {
      spy: spyTone,
      qqq: qqqTone,
      overall,
      debug: { spyPct: spy.pct, qqqPct: qqq.pct, usedField: spy.usedField },
    };
  } catch (err) {
    console.error("getPremarketFuturesTone error:", err);
    return { spy: "flat", qqq: "flat", overall: "mixed" };
  }
}

const SECTORS: Record<string, string> = {
  XLY: "Consumer Discretionary",
  XLP: "Consumer Staples",
  XLE: "Energy",
  XLF: "Financials",
  XLV: "Health Care",
  XLK: "Tech",
  XLI: "Industrials",
  XLB: "Materials",
  XLRE: "Real Estate",
  XLU: "Utilities",
  XLC: "Comm Services",
};

const SECTOR_SYMBOLS = Object.keys(SECTORS); // ["XLY", "XLP", ...]
const SECTOR_THRESHOLD = 0.15; // +/-0.15% considered "flat"
const SECTOR_CACHE_TTL = 60 * 1000; // 1 min cache

let _sectorCache: {
  at: number;
  value: string | undefined;
} | null = null;

/**
 * Summarizes sector leadership/laggards using SPDR sector ETFs.
 * Uses premarket % if available, falls back to regular market %.
 * Example output: "Leaders: Tech, Financials · Laggards: Energy, Utilities"
 */
export async function getSectorTone(): Promise<string | undefined> {
  // Return cached value if still fresh
  if (_sectorCache && Date.now() - _sectorCache.at < SECTOR_CACHE_TTL) {
    return _sectorCache.value;
  }

  try {
    const yf = new yahooFinance({ suppressNotices: ["yahooSurvey"] });
    const results = await yf.quote(SECTOR_SYMBOLS);

    // Extract change % for each sector ETF
    const sectors = results
      .map((r: any) => {
        const pre =
          typeof r.preMarketChangePercent === "number" ? r.preMarketChangePercent : undefined;
        const reg =
          typeof r.regularMarketChangePercent === "number"
            ? r.regularMarketChangePercent
            : undefined;
        const pct = pre ?? reg;
        return {
          symbol: r.symbol,
          name: SECTORS[r.symbol] ?? r.symbol,
          pct,
        };
      })
      .filter((s) => typeof s.pct === "number");

    if (!sectors.length) {
      _sectorCache = { at: Date.now(), value: undefined };
      return undefined;
    }

    // Sort by % change descending
    sectors.sort((a, b) => b.pct! - a.pct!);

    // Identify leaders and laggards
    const leaders = sectors.filter((s) => (s.pct ?? 0) > SECTOR_THRESHOLD).slice(0, 2);
    const laggards = sectors
      .filter((s) => (s.pct ?? 0) < -SECTOR_THRESHOLD)
      .slice(-2)
      .reverse();

    const leaderText = leaders.length ? `Leaders: ${leaders.map((s) => s.name).join(", ")}` : "";
    const laggardText = laggards.length
      ? `Laggards: ${laggards.map((s) => s.name).join(", ")}`
      : "";

    let summary: string | undefined;
    if (leaderText && laggardText) summary = `${leaderText} · ${laggardText}`;
    else summary = leaderText || laggardText || undefined;

    _sectorCache = { at: Date.now(), value: summary };
    return summary;
  } catch (err) {
    console.error("getSectorTone error:", err);
    _sectorCache = { at: Date.now(), value: undefined };
    return undefined;
  }
}

export async function getWatchlistSentiment(
  tickers: string[]
): Promise<Record<string, "Bullish" | "Neutral" | "Bearish" | "Unknown">> {
  try {
    const r = await fetch(`${url}/api/sentiment?tickers=${tickers.join(",")}`);
    if (!r.ok) throw new Error("Failed getting watchlist sentiment");

    const result = await r.json();
    const sentiment: Record<string, "Bullish" | "Neutral" | "Bearish" | "Unknown"> = {};
    for (const item of result.data) {
      sentiment[item.ticker] =
        item.score >= 70 ? "Bullish" : item.score < 50 ? "Bearish" : "Neutral";
    }
    return sentiment;
  } catch (error) {
    console.error("Error fetching watchlist sentiment:", error);
    return {};
  }
}
