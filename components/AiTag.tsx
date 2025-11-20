import { cn } from "@/lib/utils";
import { AITag } from "@/types";
import React from "react";

interface AiTagProps {
  tag: AITag;
  className?: string;
}
const AiTag = ({ tag, className }: AiTagProps) => {
  return (
    <span
      className={cn(
        "inline-block h-fit text-xs px-2 py-1 rounded-full text-center font-bold tracking-tight overflow-hidden whitespace-nowrap text-ellipsis",
        tag.sentiment.toLocaleLowerCase() == "positive" &&
          "bg-(--success-color)/30 text-(--success-color)",
        tag.sentiment.toLocaleLowerCase() == "negative" &&
          "bg-(--danger-color)/30 text-(--danger-color)",
        tag.sentiment.toLocaleLowerCase() == "neutral" &&
          "bg-(--warning-color)/30 text-(--warning-color)",
        className
      )}
    >
      {tag.topic}
    </span>
  );
};

export default AiTag;
