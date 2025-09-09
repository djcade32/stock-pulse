import React, { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface SearchStockRowProps {
  stock: { symbol: string; name: string };
  onSelect: (stock: { symbol: string; description: string }) => void;
  isSelected: boolean;
}

const SearchStockRow = ({ stock, onSelect, isSelected }: SearchStockRowProps) => {
  const [selected, setSelected] = useState(isSelected);
  const toggleSelected = () => {
    setSelected(!selected);
    onSelect({
      symbol: stock.symbol,
      description: stock.name,
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
      <div
        className={cn(
          "h-6 w-6 border-2 border-(--gray-accent-color) rounded-full opacity-0 group-hover:opacity-100",
          selected && "bg-(--success-color)",
          selected && "opacity-100"
        )}
      />
    </Button>
  );
};

export default SearchStockRow;
