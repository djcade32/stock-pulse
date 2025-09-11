"use client";
import React from "react";
import {
  DropdownMenu as RootDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  renderTrigger: React.ReactNode;
  items: {
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
  }[];
  className?: string;
  sideOffset?: number;
  side?: "top" | "bottom" | "left" | "right";
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

const DropdownMenu = ({
  items,
  className,
  sideOffset,
  renderTrigger,
  isOpen,
  setIsOpen,
  side = "bottom",
}: DropdownMenuProps) => {
  return (
    <RootDropdownMenu onOpenChange={() => setIsOpen && setIsOpen(!isOpen)}>
      <DropdownMenuTrigger asChild>{renderTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("w-50", className)}
        sideOffset={sideOffset}
        side={side}
        align="start"
      >
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
