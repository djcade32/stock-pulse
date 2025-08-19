import * as React from "react";

import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectProps {
  className?: string;
  placeholder?: string;
  items?: { value: string; label: string }[];
  defaultValue?: string;
}

export function Select({ className, placeholder, items = [] }: SelectProps) {
  return (
    <SelectRoot defaultValue={items.length > 0 ? items[0].value : ""}>
      <SelectTrigger
        className={cn(
          "w-full bg-(--secondary-color) outline-none border-none focus:ring-(--accent-color) cursor-pointer",
          className
        )}
      >
        <SelectValue placeholder={placeholder || "Select"} />
      </SelectTrigger>
      <SelectContent className="bg-(--secondary-color) outline-none border-none shadow">
        <SelectGroup>
          {items?.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="hover:bg-(--gray-accent-color)"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
}
