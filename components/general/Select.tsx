"use client";

import * as React from "react";

import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectProps {
  className?: string;
  placeholder?: string;
  items?: { value: string; label: string }[];
  value: string;
  prefix?: string;
  onValueChange: (value: string) => void;
}

export function Select({
  className,
  placeholder,
  items = [],
  prefix,
  onValueChange,
  value,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleValueChange = (value: string) => {
    onValueChange(value);
  };

  return (
    <SelectRoot
      defaultValue={items.length > 0 ? items[0].value : ""}
      onOpenChange={() => setIsOpen(!isOpen)}
      onValueChange={handleValueChange}
      value={value}
    >
      <SelectTrigger
        className={cn(
          "w-full bg-(--secondary-color) outline-none border-none focus:ring-(--accent-color) cursor-pointer hover:brightness-125 transition-all duration-200",
          className
        )}
        isOpen={isOpen}
      >
        {prefix && <span className="font-bold">{prefix}</span>}
        <SelectValue placeholder={placeholder || "Select"} />
      </SelectTrigger>
      <SelectContent className="bg-(--secondary-color) outline-none border border-(--gray-accent-color) shadow-md">
        <SelectGroup>
          {items?.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="hover:bg-(--color-sidebar-accent) hover:cursor-pointer"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
}
