import React from "react";

interface CompareEarningsCardRowProps {
  title: string;
  content: string | null;
  color?: "green" | "red" | "gray";
}

const CompareEarningsCardRow = ({
  title,
  content,
  color = "gray",
}: CompareEarningsCardRowProps) => {
  const colorClasses = {
    green: "(--success-color)",
    red: "(--danger-color)",
    gray: "(--secondary-text-color)",
  };
  return (
    <div className="flex gap-2">
      <div className={`max-h-full min-w-1 bg-${colorClasses[color]}`} />
      <div>
        <p className={`font-bold text-sm text-${colorClasses[color]}`}>{title}</p>
        <p className="text-sm text-(--secondary-text-color) leading-7">
          {content ? content : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default CompareEarningsCardRow;
