import React from "react";
import { Tooltip as ShadecnTooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  className?: string;
  sideOffset?: number;
}

const Tooltip = ({
  children,
  content,
  side = "top",
  align = "center",
  sideOffset = 4,
  className,
  ...props
}: TooltipProps) => {
  return (
    <ShadecnTooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        sideOffset={sideOffset}
        side={side}
        align={align}
        className={`bg-[#1a1f29] border border-[#374151] shadow-lg ${className && className}`}
        {...props}
      >
        {content}
      </TooltipContent>
    </ShadecnTooltip>
  );
};

export default Tooltip;
