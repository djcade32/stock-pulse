import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert string to kebab-case
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Insert hyphen between lowercase and uppercase letters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .toLowerCase(); // Convert to lowercase
}

export function getApiBaseUrl(): string {
  // Prefer env var so production can point to Railway/Fly/etc.
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  // Dev fallback
  return "http://localhost:8080";
}

// Fetch brand logo
export async function fetchCompanyLogo(
  stock: string,
  signal?: AbortSignal
): Promise<{ data: string | null; cached: boolean }> {
  const url = `/api/stock/logo/${stock}`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Company logo request failed: ${response.status} ${response.statusText} ${text}`
    );
  }
  return response.json();
}

// Get current quarter string like "Q1", "Q2", ...
export function getCurrentQuarter() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  if (month >= 0 && month <= 2) return "Q1";
  if (month >= 3 && month <= 5) return "Q2";
  if (month >= 6 && month <= 8) return "Q3";
  return "Q4";
}

export function getQuarterFromDate(date: Date) {
  const month = date.getMonth(); // 0-indexed
  if (month >= 0 && month <= 2) return "Q1";
  if (month >= 3 && month <= 5) return "Q2";
  if (month >= 6 && month <= 8) return "Q3";
  return "Q4";
}

export function formatToUSD(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

export function okTicker(s?: string) {
  return (s || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z.]/g, "");
}

export function formatUSD(valueInMillions: number): string {
  const symbol = valueInMillions < 0 ? "-$" : "$";
  const value = Math.abs(valueInMillions) * 1_000_000; // convert millions → raw USD
  if (value >= 1_000_000_000_000) {
    return `${symbol}${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
  } else {
    return `${symbol}${value.toFixed(2)}`;
  }
}

/** Basic utility: determine if U.S. market is likely open (Mon–Fri, 9:30–16:00 ET). */
export function isUsMarketOpen(now: Date = new Date()): boolean {
  // Convert to US/Eastern "roughly" using the client’s local time as a proxy.
  // For MVP we keep it simple; if you need precision, pass a server flag down.
  const day = now.getUTCDay(); // 0 Sun ... 6 Sat
  if (day === 0 || day === 6) return false; // weekends closed

  // Market hours in Eastern Time: 9:30–16:00
  // Approximate conversion: get Eastern time offset quickly
  // NOTE: This is a lightweight approximation for the MVP.
  const easternOffsetMinutes = -4 * 60; // EDT approx; adjust when you add a proper time util
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const easternMinutes = utcMinutes + easternOffsetMinutes;
  const minutesSinceMidnight = ((easternMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

  const open = 9 * 60 + 30; // 9:30
  const close = 16 * 60; // 16:00
  return minutesSinceMidnight >= open && minutesSinceMidnight < close;
}

export function formatMilitaryTime(timeStr: string): string {
  // Split the time string into hours and minutes
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);

  // Determine AM or PM
  const period = hour >= 12 ? "PM" : "AM";

  // Convert 24-hour to 12-hour format
  const standardHour = hour % 12 === 0 ? 12 : hour % 12;

  // Return formatted time with EST
  return `${standardHour}:${minuteStr.padStart(2, "0")} ${period} EST`;
}
