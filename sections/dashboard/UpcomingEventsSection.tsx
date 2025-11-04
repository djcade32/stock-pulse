"use client";

import AiTag from "@/components/AiTag";
import { Button as RootButton } from "@/components/ui/button";
import UpcomingEventsEarningsCard from "@/components/upcomingEvents/UpcomingEventsEarningsCard";
import { useUid } from "@/hooks/useUid";
import { useFetchWatchlistEarnings } from "@/lib/client/hooks/useFetchWatchlistEarnings";
import { useMacroEvents } from "@/lib/client/hooks/useMacroEvents";
import { cn, formatMilitaryTime } from "@/lib/utils";
import useWatchlistStore from "@/stores/watchlist-store";
import { EarningsEvent, MacroEvent, SentimentLabel, WatchlistStock } from "@/types";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import React, { useMemo } from "react";
import { FaChartLine, FaLandmark } from "react-icons/fa6";

const UpcomingEventsSection = () => {
  const { watchlist } = useWatchlistStore();
  const { data: macroEvents, isLoading: isLoadingMacroEvents } = useMacroEvents("this month");
  const { data: watchlistEarnings, isLoading: isLoadingWatchlistEarnings } =
    useFetchWatchlistEarnings(
      watchlist.map((w) => w.symbol),
      "this month"
    );
  const isLoading = isLoadingWatchlistEarnings || isLoadingMacroEvents;

  const events = useMemo(() => {
    if (isLoading) return [];
    let combinedEvents: (MacroEvent | EarningsEvent)[] = [];

    if (macroEvents) {
      combinedEvents = combinedEvents.concat(macroEvents);
    }

    if (watchlistEarnings) {
      // Add name from watchlist if exists
      watchlistEarnings.forEach((earning) => {
        const watchlistItem = watchlist.find((w) => w.symbol === earning.symbol);
        if (watchlistItem) {
          earning.name = watchlistItem.description;
        }
      });

      combinedEvents = combinedEvents.concat(watchlistEarnings);
    }

    // Sort by date ascending
    combinedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return combinedEvents;
  }, [macroEvents, watchlistEarnings, isLoading]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <h2 className="text-xl font-bold">Upcoming Events</h2>
      </div>
      <div
        className={`bg-(--secondary-color) rounded-lg p-4 flex flex-col gap-4 divide-y divide-(--gray-accent-color) ${
          isLoading && "animate-pulse"
        }`}
      >
        {events.length === 0 ? (
          isLoading ? (
            <div className="py-4 h-[209px]" />
          ) : (
            <p className="text-(--secondary-text-color)">No upcoming events.</p>
          )
        ) : (
          events.slice(0, 3).map((event, index) => {
            // Check if event is MacroEvent
            if (!("symbol" in event)) {
              const macro = event as MacroEvent;
              // Map importance to negative scale for AiTag
              const importanceMap: {
                [key: number]: { sentiment: SentimentLabel; text: string };
              } = {
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
              const dateObj = parseISO(macro.date);
              return (
                <div key={index} className="bg-(--secondary-color) p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3 tracking-tight">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg w-9 h-9",
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
                        <h3 className="font-semibold">{macro.title}</h3>
                        <p className="text-xs text-(--secondary-text-color)">
                          {macro.time && `at ${formatMilitaryTime(macro.time)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="font-semibold text-sm">{format(dateObj, "MMM d")}</p>
                      <AiTag
                        className="text-[10px]"
                        tag={{
                          sentiment: importanceMap[macro.importance || 1].sentiment,
                          topic: importanceMap[macro.importance || 1].text,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            } else {
              const earning = event as EarningsEvent;
              return (
                <div key={index}>
                  <UpcomingEventsEarningsCard earnings={earning} dashboard />
                </div>
              );
            }
          })
        )}
        {events.length > 0 && (
          <div className="flex justify-center">
            <RootButton
              asChild
              className="text-(--accent-color) hover:brightness-125 transition-all duration-200"
            >
              <Link href="/upcoming-events">
                <p>View All Events</p>
              </Link>
            </RootButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsSection;
