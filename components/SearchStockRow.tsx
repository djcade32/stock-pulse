import React, { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import useWatchlistStore from "@/stores/watchlist-store";
import useQuickChartStore from "@/stores/quick-chart-store";
import { FaBookmark } from "react-icons/fa6";
import { ChartLine } from "lucide-react";
import { WatchlistStock } from "@/types";

interface SearchStockRowProps {
  stock: { symbol: string; name: string; type: string };
  onSelect: (stock: WatchlistStock) => void;
  isSelected: boolean;
}

const SearchStockRow = ({ stock, onSelect, isSelected }: SearchStockRowProps) => {
  const { existInWatchlist } = useWatchlistStore();
  const { existInQuickChartList } = useQuickChartStore();
  const existInBothLists = existInWatchlist(stock.symbol);
  const [selected, setSelected] = useState(isSelected);
  const toggleSelected = () => {
    if (existInBothLists) return;
    setSelected(!selected);
    onSelect({
      symbol: stock.symbol,
      description: stock.name,
      type: stock.type,
    });
  };

  return (
    <Button
      onClick={toggleSelected}
      key={stock.symbol}
      className={cn(
        "group px-3 py-6 hover:bg-(--color-sidebar-accent) rounded-lg cursor-pointer flex items-center justify-between w-full smooth-animation",
        selected && "bg-(--color-sidebar-accent)"
      )}
    >
      <p className="font-semibold">
        {stock.symbol} - <span className="font-normal">{stock.name}</span>
      </p>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {existInWatchlist(stock.symbol) && <FaBookmark size={18} color="var(--accent-color)" />}
          {existInQuickChartList(stock.symbol) && (
            <ChartLine size={18} color="var(--success-color)" />
          )}
        </div>
        <div
          className={cn(
            "h-6 w-6 border-2 border-(--gray-accent-color) rounded-full opacity-0 group-hover:opacity-100",
            (selected || existInBothLists) && "bg-(--success-color)",
            selected && "opacity-100"
          )}
        />
      </div>
    </Button>
  );
};

export default SearchStockRow;
