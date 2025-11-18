"use client";
import React from "react";
import { Bell } from "lucide-react";
import HeaderDropdownMenu from "./HeaderDropdownMenu";
import StockSearch from "./StockSearch";
import { useRouter } from "next/navigation";
import BetaBadge from "./BetaBadge";
import { SidebarTrigger } from "./ui/sidebar";

const Header = () => {
  const router = useRouter();

  const handleSelectingStock = (symbol: string) => {
    router.push(`/stock?symbol=${symbol}`);
  };
  return (
    <nav className="header md:px-10 px-4 gap-2">
      <div className="flex items-center flex-1 gap-4 md:gap-10">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <p className="font-black text-2xl tracking-tighter items-center hidden md:flex">
          StockWisp
          <BetaBadge />
        </p>
        <StockSearch
          className="w-full min-w-[50px] md:w-[275px] md:min-w-[100px]"
          onSelect={(stock) => handleSelectingStock(stock.symbol)}
        />
      </div>
      <div className="flex items-center gap-2 ml-2 md:ml-0">
        {/* <div className="hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg cursor-pointer">
          <Bell color="var(--secondary-text-color)" className="cursor-pointer" />
        </div> */}
        <HeaderDropdownMenu />
      </div>
    </nav>
  );
};

export default Header;
