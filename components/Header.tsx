import React from "react";
import Input from "./general/Input";
import { Search, Bell, CircleUser, ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <nav className="border-b-2 border-(--secondary-color) py-3 px-10 flex items-center">
      <div className="flex items-center gap-10 flex-1">
        <p className="font-black text-2xl tracking-tighter">StockPulse</p>
        <Input
          type="text"
          placeholder="Search ticker or company..."
          preIcon={<Search color="var(--secondary-text-color)" size={20} />}
          className="bg-(--secondary-color) max-w-[300px] border-(--gray-accent-color) py-2"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell color="var(--secondary-text-color)" className="cursor-pointer" />
        <div className="flex items-center gap-2 cursor-pointer font-bold">
          <CircleUser color="var(--secondary-text-color)" className="cursor-pointer" />
          <p>Norman Cade</p>
          <ChevronDown color="var(--secondary-text-color)" className="cursor-pointer" />
        </div>
      </div>
    </nav>
  );
};

export default Header;
