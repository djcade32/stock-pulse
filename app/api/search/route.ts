// /app/api/search/route.ts (Next.js 13+)
import { StockHit } from "@/types";
import { NextResponse } from "next/server";

const MOCK: { symbol: string; name: string; exchange?: string }[] = [
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices, Inc.", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  const qs = new URLSearchParams({
    q,
    exchange: "US",
    token: process.env.FINNHUB_KEY!,
  });
  console.log("url: ", `https://finnhub.io/api/v1/search?${qs}`);
  const resp = await fetch(`https://finnhub.io/api/v1/search?${qs}`);
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  const data = await resp.json();
  const results = (data?.result ?? data ?? []) as StockHit[];

  return NextResponse.json({ results });
}
