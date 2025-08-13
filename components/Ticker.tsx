// components/Ticker.tsx
import { BsCaretUpFill } from "react-icons/bs";

export type Item = { symbol: string; price: number; change: "positive" | "negative" };

export default function Ticker({ items }: { items: Item[] }) {
  // Duplicate the list so the scroll loops seamlessly
  const loop = [...items, ...items];

  return (
    <div className="ticker">
      <div className="ticker__track">
        {loop.map((stock, i) => (
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
