export type MarketStatus = {
  exchange: "US" | string;
  isOpen: boolean;
  session: "pre" | "regular" | "post" | null;
  holiday: string | null;
  note: string | null;
  serverTime: number | null; // ms
  fetchedAt: number; // ms
  timezone: string | null;
};

export async function getMarketStatus(): Promise<MarketStatus> {
  const res = await fetch("/api/market-status", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch market status");
  return res.json();
}
