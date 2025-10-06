import { NextResponse } from "next/server";

const fetchCompanyProfile = async (symbol: string) => {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    symbol: symbol,
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/stock/profile2?${qs}`);
  if (!resp.ok) throw new Error("Company profile fetch failed");
  const data = await resp.json();
  return data;
};

const fetchAnalystRatings = async (symbol: string) => {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    symbol: symbol,
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/stock/recommendation?${qs}`);
  if (!resp.ok) throw new Error("Analyst ratings fetch failed");
  const data = await resp.json();
  return data;
};

const fetchEpsSurprise = async (symbol: string) => {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    symbol: symbol,
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/stock/earnings?${qs}`);
  if (!resp.ok) throw new Error("EPS surprise fetch failed");
  const data = await resp.json();
  return data;
};

const fetchNextEarningsDate = async (symbol: string) => {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    from: new Date().toISOString().split("T")[0],
    to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
    symbol: symbol,
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/calendar/earnings?${qs}`);
  if (!resp.ok) throw new Error("Next earnings date fetch failed");
  const data = await resp.json();
  if (data?.earningsCalendar?.length > 0) {
    return data.earningsCalendar[data.earningsCalendar.length - 1];
  }
  return null;
};

const fetchBasicFinancials = async (symbol: string) => {
  const token = process.env.FINNHUB_KEY!;
  const qs = new URLSearchParams({
    symbol: symbol,
    metric: "all",
    token,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/stock/metric?${qs}`);
  if (!resp.ok) throw new Error("Basic financials fetch failed");
  const data = await resp.json();
  return data;
};

// GET /api/stock/logo
// { symbol: string }

export async function GET(req: Request) {
  console.log("Received request:", req.url);
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") || "").toLocaleUpperCase();
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  const profile = await fetchCompanyProfile(symbol).catch(() => null);
  const ratings = await fetchAnalystRatings(symbol).catch(() => null);
  const eps = await fetchEpsSurprise(symbol).catch(() => null);
  const nextEarningsDate = await fetchNextEarningsDate(symbol).catch(() => null);
  const financials = await fetchBasicFinancials(symbol).catch(() => null);

  const stockProfile = {};
  if (profile) {
    Object.assign(stockProfile, {
      name: profile.name || null,
      logo: profile.logo || null,
      weburl: profile.weburl || null,
      industry: profile.finnhubIndustry || null,
      exchange: profile.exchange || null,
      analyst_recommendations: ratings || null,
      eps_surprise: eps || null,
      next_earnings_date: nextEarningsDate || null,
      financials: financials?.metric
        ? {
            marketCapitalization: financials.metric.marketCapitalization || null,
            epsTTM: financials.metric.epsTTM || null,
            currentDividendYieldTTM: financials.metric.currentDividendYieldTTM || null,
            "52WeekHigh": financials.metric["52WeekHigh"] || null,
            "52WeekLow": financials.metric["52WeekLow"] || null,
            "3MonthAverageTradingVolume": financials.metric["3MonthAverageTradingVolume"] || null,
            beta: financials.metric.beta || null,
            peTTM: financials.metric.peTTM || null,
            revenueTTM: financials.metric.marketCapitalization / financials.metric.psTTM || null,
          }
        : null,
    });
  }

  return NextResponse.json({ data: stockProfile }, { status: 200 });
}
