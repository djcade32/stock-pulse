"use client";
import React, { useState } from "react";
import {
  DropdownMenu as RootDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CircleUser } from "lucide-react";
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

const DropdownMenu = ({ items, className, sideOffset }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <RootDropdownMenu onOpenChange={() => setIsOpen(!isOpen)}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-50", className)} sideOffset={sideOffset}>
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        {items &&
          items.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="hover:bg-(--color-sidebar-accent) hover:cursor-pointer"
              onClick={item.onClick}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </RootDropdownMenu>
  );
};

export default DropdownMenu;
