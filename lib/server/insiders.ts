import { FinnhubInsiderTransaction, InsiderSummaryRow } from "@/types";

// Treat these as "buy" codes for summary
const BUY_CODES = new Set(["P", "A", "M"]); // Purchase / Award / Exercise
// Treat these as "sell" codes for summary
const SELL_CODES = new Set(["S", "D", "G"]); // Sale / Disposition / Gift

function isLaterDate(a: string, b: string) {
  // Dates are ISO "YYYY-MM-DD" so string compare is safe
  return a > b;
}

export function buildInsiderSummary(
  transactions: FinnhubInsiderTransaction[]
): InsiderSummaryRow[] {
  const byName = new Map<string, InsiderSummaryRow>();

  for (const tx of transactions) {
    const { name, change, transactionCode, transactionDate, transactionPrice } = tx;

    if (!name) continue;

    const existing = byName.get(name) ?? {
      name,
      netShares: 0,
      totalBuys: 0,
      totalSells: 0,
      lastTradeDate: null as string | null,
      lastTradeCode: null as string | null,
      lastTradePrice: null as number | null,
    };

    // Only aggregate if we have a non-zero change
    if (change !== 0) {
      if (BUY_CODES.has(transactionCode) && change > 0) {
        existing.totalBuys += change;
        existing.netShares += change;
      } else if (SELL_CODES.has(transactionCode) && change < 0) {
        const abs = Math.abs(change);
        existing.totalSells += abs;
        existing.netShares -= abs;
      } else {
        // For weird combinations, just add to netShares
        existing.netShares += change;
      }
    }

    // Track latest trade info
    if (!existing.lastTradeDate || isLaterDate(transactionDate, existing.lastTradeDate)) {
      existing.lastTradeDate = transactionDate;
      existing.lastTradeCode = transactionCode;
      existing.lastTradePrice = transactionPrice || null;
    }

    byName.set(name, existing);
  }

  const rows = Array.from(byName.values());

  // Sort by absolute netShares desc (largest “movers” first)
  rows.sort((a, b) => Math.abs(b.netShares) - Math.abs(a.netShares));

  return rows;
}
