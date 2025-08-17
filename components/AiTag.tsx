import { cn } from "@/lib/utils";
import React from "react";

interface AiTagProps {
  tag: {
    sentiment: "Positive" | "Negative" | "Neutral";
    tag: string;
  };
}
const AiTag = ({ tag }: AiTagProps) => {
  return (
    <span
      className={cn(
        "inline-block text-xs px-2 py-1 rounded-full text-center font-bold tracking-tight overflow-hidden whitespace-nowrap text-ellipsis",
        tag.sentiment === "Positive" && "bg-(--success-color)/30 text-(--success-color)",
        tag.sentiment === "Negative" && "bg-(--danger-color)/30 text-(--danger-color)",
        tag.sentiment === "Neutral" && "bg-(--warning-color)/30 text-(--warning-color)"
      )}
    >
      {tag.tag}
    </span>
  );
};

export default AiTag;
