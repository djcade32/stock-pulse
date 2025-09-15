import React from "react";
import { Bell } from "lucide-react";
import HeaderDropdownMenu from "./HeaderDropdownMenu";
import StockSearch from "./StockSearch";

const Header = () => {
  return (
    <nav className="border-b-2 border-(--secondary-color) bg-(--background) py-3 px-10 flex items-center fixed top-0 md:left-[64px] right-0 z-50 ">
      <div className="flex items-center gap-10 flex-1">
        <p className="font-black text-2xl tracking-tighter">StockPulse</p>
        <StockSearch className="w-[275px] min-w[100px]" />
      </div>
      <div className="flex items-center gap-2">
        <div className="hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg cursor-pointer">
          <Bell color="var(--secondary-text-color)" className="cursor-pointer" />
        </div>
        <HeaderDropdownMenu />
      </div>
    </nav>
  );
};

export default Header;
