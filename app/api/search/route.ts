import { StockHit } from "@/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();

  const qs = new URLSearchParams({
    q,
    exchange: "US",
    token: process.env.FINNHUB_KEY!,
  });
  const resp = await fetch(`https://finnhub.io/api/v1/search?${qs}`);
  if (!resp.ok) throw new Error(`Search failed: ${resp.status}`);
  const data = await resp.json();
  const results = (data?.result ?? data ?? []) as StockHit[];

  return NextResponse.json({ results });
}
