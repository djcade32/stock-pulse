import React from "react";
import { IconType } from "react-icons";
import LoaderComponent from "./general/LoaderComponent";

interface StockProfileFinancialCardProps {
  label: string;
  value: string | number;
  icon?: IconType | React.ElementType | null;
}

const StockProfileFinancialCard = ({ label, value, icon }: StockProfileFinancialCardProps) => {
  return (
    <div className="flex flex-col justify-between bg-(--secondary-color) px-4 py-2 rounded-lg gap-2">
      <div className="flex items-center justify-between">
        <p className="text-(--secondary-text-color) text-sm">{label}</p>
        {icon && React.createElement(icon, { className: "text-(--secondary-text-color)" })}
      </div>
      <p className={`font-bold text-2xl ${value === "—" && "text-(--secondary-text-color)"}`}>
        {value}
      </p>
    </div>
  );
};

export default StockProfileFinancialCard;
