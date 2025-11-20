// app/api/market-status/route.ts
import { NextResponse } from "next/server";

type FinnhubMarketStatus = {
  exchange?: string; // e.g. "US"
  isOpen?: boolean; // true/false
  t?: number; // server time (unix seconds)
  holiday?: string | null; // sometimes provided
  session?: string | null; // e.g. "regular", "pre", "post"
  note?: string | null;
  timezone?: string | null;
};

export const dynamic = "force-dynamic"; // no ISR caching for this route

export async function GET() {
  const token = process.env.FINNHUB_KEY;
  if (!token) {
    return NextResponse.json({ error: "Missing FINNHUB_KEY" }, { status: 500 });
  }

  const url = new URL("https://finnhub.io/api/v1/stock/market-status");
  url.searchParams.set("exchange", "US"); // NYSE/Nasdaq aggregate
  url.searchParams.set("token", token);

  try {
    const res = await fetch(url.toString(), {
      // Market status can flip minute-to-minute around the open/close; avoid CDN caching.
      headers: { accept: "application/json" },
      cache: "no-store",
      // (Optional) small timeout using AbortController if you prefer
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Finnhub error", status: res.status, body: text },
        { status: 502 }
      );
    }

    const raw: FinnhubMarketStatus = await res.json();

    // Normalize a compact shape StockWisp can rely on
    const now = Date.now();
    const serverEpochMs = (raw.t ?? 0) * 1000;

    return NextResponse.json(
      {
        exchange: raw.exchange ?? "US",
        isOpen: Boolean(raw.isOpen),
        session: raw.session ?? null, // "pre" | "regular" | "post" | null
        holiday: raw.holiday ?? null,
        note: raw.note ?? null,
        serverTime: serverEpochMs || null,
        fetchedAt: now,
        timezone: raw.timezone ?? null,
      },
      {
        status: 200,
        headers: {
          // Re-validate quickly; clients can still poll at their own cadence.
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Network/parse error", message: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
