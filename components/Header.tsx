"use client";
import React from "react";
import { Bell } from "lucide-react";
import HeaderDropdownMenu from "./HeaderDropdownMenu";
import StockSearch from "./StockSearch";
import { useRouter } from "next/navigation";
import BetaBadge from "./BetaBadge";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Header = () => {
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleSelectingStock = (symbol: string) => {
    router.push(`/stock?symbol=${symbol}`);
  };
  return (
    <nav className={cn("header", isMobile ? "px-4" : "px-10")}>
      <div className={cn("flex items-center flex-1", isMobile ? "gap-4" : "gap-10")}>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        {!isMobile && (
          <p className="font-black text-2xl tracking-tighter flex items-center">
            StockWisp
            <BetaBadge />
          </p>
        )}
        <StockSearch
          className={cn(isMobile ? "w-full min-w-[50px]" : "w-[275px] min-w-[100px]")}
          onSelect={(stock) => handleSelectingStock(stock.symbol)}
        />
      </div>
      <div className={cn("flex items-center gap-2", isMobile && "ml-2")}>
        {/* <div className="hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg cursor-pointer">
          <Bell color="var(--secondary-text-color)" className="cursor-pointer" />
        </div> */}
        <HeaderDropdownMenu />
      </div>
    </nav>
  );
};

export default Header;
