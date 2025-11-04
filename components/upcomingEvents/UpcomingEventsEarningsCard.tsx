import { useCompanyLogo } from "@/lib/client/hooks/useCompanyLogo";
import { cn } from "@/lib/utils";
import { EarningsEvent } from "@/types";
import Link from "next/link";
import React from "react";
import { format, parseISO } from "date-fns";

interface UpcomingEventsEarningsCardProps {
  earnings: EarningsEvent;
  dashboard?: boolean;
}

const UpcomingEventsEarningsCard = ({ earnings, dashboard }: UpcomingEventsEarningsCardProps) => {
  const { symbol: ticker, name, quarter, year, hour, date } = earnings;
  const dateObj = parseISO(date);
  const { url: logoUrl, isLoading } = useCompanyLogo(ticker);

  const marketTimeMap: { [key: string]: string } = {
    bmo: "Before Market Open",
    amc: "After Market Close",
    dmt: "During Market Trading",
  };

  return (
    <div
      className={cn(
        "bg-(--secondary-color) p-4 rounded-lg ",
        !dashboard && "border-l-4 border-l-(--success-color)"
      )}
    >
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          <Link href={`/stock?symbol=${ticker}`} className="flex-shrink-0">
            {logoUrl.data && !isLoading ? (
              <img
                src={logoUrl.data}
                alt={`${ticker} logo`}
                className="!w-9 h-9 rounded-lg bg-white bg-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-(--secondary-text-color) text-foreground font-bold flex items-center justify-center">
                <p>{ticker[0]}</p>
              </div>
            )}
          </Link>
          <div>
            <h3 className="font-bold">{`${name} (${ticker}) Q${quarter} ${year} Earnings`}</h3>
            <p className="text-(--secondary-text-color) text-xs">
              {dashboard ? marketTimeMap[hour] : "Earnings Call"}
            </p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm">
            {dashboard ? format(dateObj, "MMM d") : marketTimeMap[hour]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEventsEarningsCard;
