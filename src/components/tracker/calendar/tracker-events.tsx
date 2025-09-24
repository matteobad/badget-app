"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { memo, useMemo } from "react";
import { cn } from "~/lib/utils";
import { formatAmount } from "~/shared/helpers/format";
import { format } from "date-fns";

import type { TZDate } from "@date-fns/tz";

type Props = {
  isToday: boolean;
  allData: RouterOutput["recurringEntry"]["byRange"]["result"] | undefined;
  currentDate: TZDate;
  onEventClick?: (eventId: string, date: TZDate) => void;
};

export const TrackerEvents = memo(
  ({ isToday, allData, currentDate }: Props) => {
    // Process entries to handle midnight spanning - EXACTLY like weekly calendar
    const processedEntries = useMemo(() => {
      // currentDate is already a TZDate in user timezone (like weekly calendar)
      const currentDayStr = format(currentDate, "yyyy-MM-dd");
      const allEntries = [];

      // Process current day data (exactly like weekly calendar)
      const currentDayData = allData?.[currentDayStr] ?? [];

      for (const event of currentDayData) {
        // Always show entries stored under the current date
        if (event.date === currentDayStr) {
          // This entry was created on this date - show it as the primary display
          allEntries.push({
            ...event,
            sortKey: `${event.date}`,
          });
        }
        // If entry doesn't belong to this day, skip it (same as weekly calendar)
      }

      // Sort entries by start time for consistent display
      allEntries.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

      return allEntries;
    }, [allData, currentDate]);

    return (
      <div className="flex w-full flex-col space-y-2 overflow-hidden font-sans">
        {processedEntries.map((entry, index) => {
          if (index === 0) {
            // Show the first event (chronologically)
            return (
              <div
                key={entry.id}
                className={cn(
                  "flex min-h-[23px] w-full items-center overflow-hidden p-1 text-left text-xs transition-colors",
                  // Same styling for all events
                  "bg-[#F0F0F0] text-[#606060] dark:bg-[#1D1D1D] dark:text-[#878787]",
                  isToday && "!bg-background",
                )}
                data-event-id={entry.id}
              >
                <div className="flex w-full items-center gap-1 truncate">
                  {/* Subtle green dot indicator for running timers */}
                  <span className="relative flex h-1 w-1 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-1 w-1 rounded-full bg-green-500" />
                  </span>

                  <span className="truncate">
                    {entry.name}
                    {" ("}
                    {formatAmount({
                      amount: entry.amount,
                      currency: entry.currency,
                    })}
                    {")"}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}
        {processedEntries.length > 1 && (
          <div
            className="w-full cursor-pointer overflow-hidden p-1 text-left text-xs text-primary"
            data-show-all-events="true"
          >
            <div className="truncate">+{processedEntries.length - 1} more</div>
          </div>
        )}
      </div>
    );
  },
);

TrackerEvents.displayName = "TrackerEvents";
