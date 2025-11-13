import OpenAI from "openai";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { EarningsEvent, MacroEvent, WhisperDoc } from "@/types";
import { getUserWatchlistStocks } from "../watchlist";
import {
  getPremarketFuturesTone,
  getSectorTone,
  getTodayMacroEvents,
  getWatchlistSentiment,
} from "./data-getters";
import { fetchWatchlistEarnings } from "../fetchWatchlistEarnings";

dayjs.extend(utc);
dayjs.extend(timezone);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const TZ = "America/New_York";
const todayNY = () => dayjs().tz(TZ).format("YYYY-MM-DD");
const nowISO = () => dayjs().utc().toISOString();

const WhisperSchema = z.object({
  summary: z.string().min(20).max(800),
  sentiment: z.enum(["Bullish", "Neutral", "Bearish"]),
});

function buildPrompt(input: {
  tickers: string[];
  macroEvents: MacroEvent[];
  futures: { spy: string; qqq: string; overall: string };
  sectorTone?: string;
  earningsToday: EarningsEvent[];
  watchlistSentiment: Record<string, "Bullish" | "Neutral" | "Bearish" | "Unknown">;
}) {
  const macroStr = input.macroEvents.length ? input.macroEvents.join("; ") : "None";
  const earningsStr = input.earningsToday.length ? input.earningsToday.join(", ") : "None";
  const isPremarket = dayjs().tz(TZ).hour() < 9.5;
  const isAfterMarket = dayjs().tz(TZ).hour() >= 16;
  const marketTxt = isPremarket ? "premarket" : "market";
  const wlSent =
    Object.entries(input.watchlistSentiment)
      .map(([t, s]) => `${t}: ${s}`)
      .join("; ") || "Unknown";

  return `
You are StockWisp’s dedicated financial market analyst. Your job is to generate a concise, professional daily market brief for the StockWisp dashboard.

Context you must use:

User watchlist tickers: ${input.tickers.join(", ")}

Incorporate relevant macro events that affect markets today (e.g., CPI, FOMC, GDP, Jobs Report).
Today's macro events: ${macroStr}

Use ${marketTxt} trends for major indices (SPY, QQQ), sector tone, and overall futures direction.
${marketTxt}: SPY=${input.futures.spy}, QQQ=${input.futures.qqq}, Overall=${input.futures.overall}${
    input.sectorTone ? `, Sector tone: ${input.sectorTone}` : ""
  }

Apply current sentiment for both the overall market and the user’s watchlist stocks.
Watchlist sentiment: ${wlSent}

Mention earnings only if one of the watchlist stocks reports today. If none do, omit earnings entirely.
Earnings today (from watchlist): ${earningsStr}

Don't just summarize the given data. Use the data and the current market news to give investors insight into why stocks are moving a certain way. We are trying to give investors an edge.

Output Rules:
Write 3–5 sentences maximum.
Style: professional, natural, fast to read—similar to a trader’s ${marketTxt} morning note.
No bullet points, no lists.
Mention only what is relevant today.
Include a single clear statement of overall market sentiment using one of:
Bullish, Neutral, Bearish

Output must be strictly in this JSON format:
{
  "summary": "<3–5 sentence market brief>",
  "sentiment": "Bullish | Neutral | Bearish"
}

Goal:
Produce a quick, high-signal-to-noise ${
    isPremarket ? "morning" : isAfterMarket ? "evening" : "midday"
  } briefing that feels like a professional market desk update placed at the top of the StockWisp dashboard.
Use ${
    isPremarket ? "future" : isAfterMarket ? "past" : "current"
  } tense as appropriate. (e.g., "The market is set to open higher" vs. "The market is trading higher").
  Keep in mind that this is for the retail investor. Investors should be able to easily comprehend this brief.
`.trim();
}

export async function generateUserWhisper(uid: string): Promise<WhisperDoc> {
  const date = todayNY();
  const now = dayjs();
  const [tickers, macroEvents, futures, sectorTone] = await Promise.all([
    (await getUserWatchlistStocks(uid)).map((s) => s.symbol),
    getTodayMacroEvents(),
    getPremarketFuturesTone(),
    getSectorTone(),
  ]);

  const start = now.startOf("day");
  const end = now.endOf("day");

  const [earningsToday, watchlistSentiment] = await Promise.all([
    fetchWatchlistEarnings(now, tickers, start, end),
    getWatchlistSentiment(tickers),
  ]);

  const prompt = buildPrompt({
    tickers,
    macroEvents,
    futures,
    sectorTone,
    earningsToday,
    watchlistSentiment,
  });

  const resp = await client.chat.completions.create({
    model: "gpt-5-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Only output JSON matching the requested schema." },
      { role: "user", content: prompt },
    ],
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  let summary = "We’re preparing your Market Whisper. Check back shortly.";
  let sentiment: WhisperDoc["sentiment"] = "Neutral";

  try {
    const parsed = WhisperSchema.parse(JSON.parse(raw));
    summary = parsed.summary.trim();
    sentiment = parsed.sentiment;
  } catch {}

  return {
    uid,
    date,
    summary,
    sentiment,
    generatedAt: nowISO(),
    inputs: { tickers, macroEvents, futures, sectorTone, earningsToday, watchlistSentiment },
  };
}
