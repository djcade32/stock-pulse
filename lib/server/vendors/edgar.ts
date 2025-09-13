import * as cheerio from "cheerio";

// Required by SEC. Keep it in env and always send it.
const SEC_UA = process.env.SEC_USER_AGENT || "StockPulse/1.0 (contact: missing@example.com)";

async function secJson(url: string) {
  const r = await fetch(url, {
    headers: { "User-Agent": SEC_UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`SEC HTTP ${r.status} for ${url}`);
  return r.json();
}
async function secText(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": SEC_UA }, cache: "no-store" });
  if (!r.ok) throw new Error(`SEC HTTP ${r.status} for ${url}`);
  return r.text();
}

/** Map TICKER -> CIK using SEC’s company_tickers.json */
export async function getCikFromTicker(ticker: string): Promise<string> {
  const lower = ticker.toLowerCase();
  const url = "https://www.sec.gov/files/company_tickers.json";
  const data = await secJson(url); // shape: { "0": { cik_str, ticker, title }, ... }
  const entry = Object.values<any>(data).find((x: any) => (x.ticker || "").toLowerCase() === lower);
  if (!entry) throw new Error(`CIK not found for ${ticker}`);
  const cik = String(entry.cik_str).padStart(10, "0"); // submissions API expects 10-digit
  return cik;
}

/** Find the latest 10-Q (prefer) or 10-K for a CIK */
export async function getLatest10Qor10K(cik10: string): Promise<{
  form: "10-Q" | "10-K";
  filingDate: string; // 2025-08-28
  accessionNo: string; // e.g. 0001045810-25-000123
  primaryDoc: string; // e.g. a10q.htm
}> {
  const subs = await secJson(`https://data.sec.gov/submissions/CIK${cik10}.json`);
  const forms: string[] = subs?.filings?.recent?.form || [];
  const dates: string[] = subs?.filings?.recent?.filingDate || [];
  const accessions: string[] = subs?.filings?.recent?.accessionNumber || [];
  const primaryDocs: string[] = subs?.filings?.recent?.primaryDocument || [];

  // Walk in order and pick first 10-Q; fallback to first 10-K
  let idxQ = forms.findIndex((f) => f === "10-Q");
  let idxK = forms.findIndex((f) => f === "10-K");
  const pick = idxQ >= 0 ? idxQ : idxK;
  if (pick < 0) throw new Error("No 10-Q/10-K found in recent filings");

  return {
    form: forms[pick] as "10-Q" | "10-K",
    filingDate: dates[pick],
    accessionNo: accessions[pick],
    primaryDoc: primaryDocs[pick],
  };
}

/** Build raw file URL for primary doc */
export function buildFilingDocUrl(cik10: string, accessionNo: string, primaryDoc: string): string {
  // EDGAR path uses CIK without leading zeros and accession without dashes
  const cikNoZeros = String(parseInt(cik10, 10));
  const accNoNoDashes = accessionNo.replace(/-/g, "");
  return `https://www.sec.gov/Archives/edgar/data/${cikNoZeros}/${accNoNoDashes}/${primaryDoc}`;
}

/** Extract readable text from a filing document (HTML or text) */
export async function fetchFilingText(docUrl: string): Promise<string> {
  const raw = await secText(docUrl);
  const ct = raw.slice(0, 500).toLowerCase(); // quick peek
  if (ct.includes("<html") || ct.includes("<head") || ct.includes("<body")) {
    const $ = cheerio.load(raw);
    // remove tables of contents/menus/scripts/styles
    $("script,style,nav,header,footer").remove();
    const text = $("body").text();
    return normalize(text);
  }
  // plain text filing
  return normalize(raw);
}

function normalize(s: string): string {
  return s
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Optional: fetch XBRL facts JSON (for KPIs) */
export async function fetchCompanyFacts(cik10: string): Promise<any | null> {
  try {
    return await secJson(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik10}.json`);
  } catch {
    return null;
  }
}
