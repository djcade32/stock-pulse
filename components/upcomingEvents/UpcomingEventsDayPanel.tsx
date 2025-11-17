import { EarningsEvent, MacroEvent, SentimentLabel } from "@/types";
import { format, parseISO } from "date-fns";
import React from "react";
import { FaChartLine, FaLandmark } from "react-icons/fa6";
import AiTag from "../AiTag";
import { cn, formatMilitaryTime } from "@/lib/utils";
import UpcomingEventsEarningsCard from "./UpcomingEventsEarningsCard";

interface UpcomingEventsDayPanelProps {
  date: string;
  events: (MacroEvent | EarningsEvent)[];
}

const UpcomingEventsDayPanel = ({ date, events }: UpcomingEventsDayPanelProps) => {
  const dateObj = parseISO(date);

  return (
    <div className="flex gap-2">
      <div className="hidden min-h-full w-[1.5px] bg-gradient-to-b from-(--accent-color) to-transparent rounded-full relative md:flex flex-col items-center">
        <div className="bg-(--accent-color) rounded-full h-2 w-2 mt-6" />
      </div>
      <div className="w-full">
        <div className="mb-4">
          <h2 className="text-lg font-semibold ">{format(dateObj, "EEEE, MMMM d, yyyy")}</h2>
          <p className="text-(--secondary-text-color) text-sm ">
            {`${events.length} ${events.length > 1 ? "events" : "event"} scheduled ${
              events.length > 3 ? "•" : ""
            }`}{" "}
            <span className="text-(--danger-color)">{events.length > 3 && " High Impact Day"}</span>
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {events.map((event, index) => {
            // Check if event is MacroEvent
            if (!("symbol" in event)) {
              const macro = event as MacroEvent;

              // Map importance to negative scale for AiTag
              const importanceMap: { [key: number]: { sentiment: SentimentLabel; text: string } } =
                {
                  1: {
                    sentiment: "positive",
                    text: "Low",
                  },
                  2: {
                    sentiment: "neutral",
                    text: "Medium",
                  },
                  3: {
                    sentiment: "negative",
                    text: "High",
                  },
                };

              return (
                <li
                  key={index}
                  className={cn(
                    "bg-(--secondary-color) p-4 rounded-lg border-l-4",
                    macro.importance
                      ? importanceMap[macro.importance].sentiment === "positive"
                        ? "border-l-(--success-color)"
                        : importanceMap[macro.importance].sentiment === "negative"
                        ? "border-l-(--danger-color)"
                        : "border-l-(--warning-color)"
                      : "border-l-(--gray-accent-color)"
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <div className="flex items-center gap-3 tracking-tight">
                      <div
                        className={cn(
                          "items-center justify-center rounded-lg w-9 h-9 shrink-0 hidden md:flex",
                          macro.category === "FOMC"
                            ? "bg-(--accent-color)"
                            : "bg-(--warning-color)/20 text-(--warning-color)"
                        )}
                      >
                        {macro.category === "FOMC" ? (
                          <FaLandmark />
                        ) : (
                          <FaChartLine className="text-(--warning-color)" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">{macro.title}</h3>
                        <p className="text-xs text-(--secondary-text-color)">
                          {macro.category === "FOMC"
                            ? "Federal Reserve Meeting"
                            : "Economic Data Release"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {macro.category !== "FOMC" && macro.time && (
                        <p className="font-semibold text-xs md:text-sm">
                          {formatMilitaryTime(macro.time)}
                        </p>
                      )}
                      <AiTag
                        className="text-[10px]"
                        tag={{
                          sentiment: importanceMap[macro.importance || 1].sentiment,
                          topic: importanceMap[macro.importance || 1].text,
                        }}
                      />
                    </div>
                  </div>
                </li>
              );
            } else {
              return (
                <li key={index}>
                  <UpcomingEventsEarningsCard earnings={event} />
                </li>
              );
            }
          })}
        </ul>
      </div>
    </div>
  );
};

export default UpcomingEventsDayPanel;
