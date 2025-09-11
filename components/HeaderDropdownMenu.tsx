"use client";

import React, { useState } from "react";
import { CircleUser, Settings, LogOut, ChevronDown } from "lucide-react";
import DropdownMenu from "./general/DropdownMenu";
import { signOut } from "@/lib/actions/auth.client.action";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  items?: {
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
  className?: string;
  sideOffset?: number;
}

const DROPDOWN_ITEMS = [
  { label: "Profile", icon: <CircleUser size={16} /> },
  { label: "Settings", icon: <Settings size={16} /> },
  { label: "Logout", icon: <LogOut size={16} />, onClick: signOut },
];

const HeaderDropdownMenu = ({ items, className, sideOffset }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <DropdownMenu
      items={DROPDOWN_ITEMS}
      sideOffset={20}
      renderTrigger={
        <div
          onMouseEnter={() => setIsHovered(!isHovered)}
          onMouseLeave={() => setIsHovered(!isHovered)}
          className="flex items-center gap-2 cursor-pointer font-bold hover:bg-(--color-sidebar-accent) transition-colors duration-200 p-2 rounded-lg"
        >
          <CircleUser
            color={cn(isHovered ? "var(--foreground)" : "var(--secondary-text-color)")}
            className="cursor-pointer"
          />
          <p>Norman Cade</p>
          <ChevronDown
            color="var(--secondary-text-color)"
            className={`cursor-pointer ${isOpen && "rotate-180 transition-transform duration-200"}`}
          />
        </div>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    />
  );
};

export default HeaderDropdownMenu;
