"use client";

import LoaderComponent from "@/components/general/LoaderComponent";
import Tabs from "@/components/general/Tabs";
import UpcomingEventsDayPanel from "@/components/upcomingEvents/UpcomingEventsDayPanel";
import { db } from "@/firebase/client";
import { useUid } from "@/hooks/useUid";
import { track } from "@/lib/analytics";
import { useFetchUpcomingEvents } from "@/lib/client/hooks/useFetchUpcomingEvents";
import { useFetchWatchlistEarnings } from "@/lib/client/hooks/useFetchWatchlistEarnings";
import { useMacroEvents } from "@/lib/client/hooks/useMacroEvents";
import { EarningsEvent, MacroEvent, WatchlistStock } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";

type DateRange = "this month" | "next week" | "this week";

const UpcomingEventsPage = () => {
  track("opened_upcoming_events_page");
  const tabEventValues = [{ label: "All" }, { label: "Economic" }, { label: "My Watchlist" }];
  const tabDateRangeValues = [
    { label: "This Week" },
    { label: "Next Week" },
    { label: "This Month" },
  ];
  const { uid, loading } = useUid();

  const [currentEventTab, setCurrentEventTab] = useState("all");
  const [currentDateRangeTab, setCurrentDateRangeTab] = useState("this week");
  const [watchlist, setWatchlist] = useState<
    {
      symbol: string;
      name: string;
    }[]
  >([]);

  const { data: weeklyAnalysis, isLoading: isLoadingWeeklyAnalysis } = useFetchUpcomingEvents();
  const { data: macroEvents, isLoading: isLoadingMacroEvents } = useMacroEvents(
    currentDateRangeTab as DateRange
  );
  const { data: watchlistEarnings, isLoading: loadingWatchlistEarnings } =
    useFetchWatchlistEarnings(
      watchlist.map((w) => w.symbol),
      currentDateRangeTab as DateRange
    );
  const isLoading = loadingWatchlistEarnings || isLoadingMacroEvents;

  useQuery({
    queryKey: ["watchlist", uid], // include uid in key so it refetches per user
    queryFn: async () => {
      const watchlisttDoc = doc(db, `watchlists/${uid}`);
      const fetchedDoc = await getDoc(watchlisttDoc);

      if (fetchedDoc.exists() && fetchedDoc.data().stocks) {
        const stocks = fetchedDoc.data().stocks;

        setWatchlist(
          stocks.map((s: WatchlistStock) => ({ symbol: s.symbol, name: s.description }))
        );
      }
      return true;
    },
    enabled: !!uid && !loading, // prevent running before uid is ready
  });

  const byDayEvents = useMemo(() => {
    const eventsByDay: { [date: string]: (MacroEvent | EarningsEvent)[] } = {};

    if (macroEvents && (currentEventTab === "all" || currentEventTab === "economic")) {
      macroEvents.forEach((event) => {
        const dateKey = event.date;
        if (!eventsByDay[dateKey]) {
          eventsByDay[dateKey] = [];
        }

        // Grab and add both FOMC dates to events list
        if (event.category === "FOMC") {
          if (event.span) {
            const startDateKey = event.span.start;
            const endDateKey = event.span.end;
            if (!eventsByDay[startDateKey]) {
              eventsByDay[startDateKey] = [];
            }
            eventsByDay[startDateKey].push(event);
            if (startDateKey !== endDateKey) {
              if (!eventsByDay[endDateKey]) {
                eventsByDay[endDateKey] = [];
              }
              eventsByDay[endDateKey].push(event);
            }
          }
        } else {
          eventsByDay[dateKey].push(event);
        }
      });
    }

    if (watchlistEarnings && (currentEventTab === "all" || currentEventTab === "my watchlist")) {
      watchlistEarnings.forEach((event) => {
        const dateKey = event.date;
        if (!eventsByDay[dateKey]) {
          eventsByDay[dateKey] = [];
        }
        // Add name from watchlist if exists
        const watchlistItem = watchlist.find((w) => w.symbol === event.symbol);
        if (watchlistItem) {
          event.name = watchlistItem.name;
        }
        eventsByDay[dateKey].push(event);
      });
    }

    // ---- New: helper to map events to a sortable time ----
    function timeFromEvent(e: MacroEvent | EarningsEvent): string | null {
      // MacroEvent with explicit time (HH:MM)
      if ("time" in e && typeof e.time === "string" && e.time) return e.time;

      // EarningsEvent session buckets → synthetic times (tweak as needed)
      if ("hour" in e) {
        if (e.hour === "bmo") return "06:30"; // before market open
        if (e.hour === "amc") return "16:05"; // after market close
        // 'tbd' has no concrete time
        return null;
      }
      return null;
    }

    // Sort events for each day: items with a time first, earliest → latest; no-time at end
    Object.keys(eventsByDay).forEach((date) => {
      eventsByDay[date].sort((a, b) => {
        const ta = timeFromEvent(a);
        const tb = timeFromEvent(b);

        if (ta && !tb) return -1;
        if (!ta && tb) return 1;
        if (!ta && !tb) return 0;

        // both have times -> earliest first
        return ta!.localeCompare(tb!);
      });
    });

    return eventsByDay;
  }, [currentEventTab, macroEvents, watchlistEarnings, watchlist]);

  return (
    <div className="page">
      <div>
        <h1 className="page-header-text">Upcoming Events</h1>
        <p className="text-(--secondary-text-color)">
          Stay informed about key market and company events.
        </p>
      </div>
      <div className="flex gap-4">
        <Tabs values={tabEventValues} onValueChange={setCurrentEventTab} />
        <Tabs
          values={tabDateRangeValues}
          tabClassName="data-[state=active]:bg-(--gray-accent-color)"
          onValueChange={setCurrentDateRangeTab}
        />
      </div>
      <div className="bg-(--secondary-color) rounded-lg p-4">
        <h2 className="font-bold text-lg mb-2">Week Analysis</h2>
        <LoaderComponent loading={isLoadingWeeklyAnalysis} height="50px" width="100%" rounded="lg">
          <p className="text-(--secondary-text-color)">{weeklyAnalysis}</p>
        </LoaderComponent>
      </div>
      <div className="flex flex-col gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[143px] bg-(--secondary-color) rounded-lg animate-pulse" />
          ))
        ) : (
          <>
            {Object.keys(byDayEvents).length === 0 && (
              <p className="text-(--secondary-text-color) mt-4">No upcoming events.</p>
            )}
            {Object.entries(byDayEvents).map(([date, events]) => (
              <UpcomingEventsDayPanel key={date} date={date} events={events} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingEventsPage;
