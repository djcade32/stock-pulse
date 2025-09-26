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
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/stock/logo/${stock}`;
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
