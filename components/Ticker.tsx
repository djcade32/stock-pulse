"use client";

import { useBatchQuotes } from "@/lib/client/hooks/useBatchQuotes";
import { useEffect, useState } from "react";
import { BsCaretUpFill } from "react-icons/bs";

export type Item = { symbol: string; price: number; change: "positive" | "negative" };

const STOCK_SYMBOLS: string[] = [
  "MSFT",
  "AAPL",
  "GOOGL",
  "AMZN",
  "TSLA",
  "NFLX",
  "META",
  "NVDA",
  "SPY",
  "QQQ",
  "DIA",
  "XOM",
  "IBIT",
  "V",
  "JPM",
  "WMT",
];

export default function Ticker() {
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const { quotesBySymbol, isLoading } = useBatchQuotes(STOCK_SYMBOLS, {
    enabled: true,
    marketRefetchMs: 60_000,
  });

  useEffect(() => {
    if (!isLoading && quotesBySymbol) {
      const updatedItems: Item[] = STOCK_SYMBOLS.map((symbol) => {
        const quote = quotesBySymbol[symbol];
        return {
          symbol,
          price: quote ? quote.c : 0,
          change: quote ? (quote.dp >= 0 ? "positive" : "negative") : "positive",
        };
      });
      setStockItems(updatedItems);
    }
  }, [STOCK_SYMBOLS, isLoading, quotesBySymbol]);

  return (
    <div className="ticker">
      <div className="ticker__track">
        {[...stockItems, ...stockItems].map((stock, i) => (
          <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2 min-w-fit">
            <p className="text-[color:var(--accent-color,#2188fe)]/60 font-medium tabular-nums">
              {stock.symbol} {stock.price.toFixed(2)}
            </p>
            {stock.change ? (
              stock.change === "positive" ? (
                <BsCaretUpFill className="text-[color:var(--success-color,#16a34a)]" />
              ) : (
                <BsCaretUpFill className="text-[color:var(--danger-color,#dc2626)] rotate-180" />
              )
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
