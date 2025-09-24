"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { memo, useMemo } from "react";
import { TZDate } from "@date-fns/tz";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";
import { createSafeDate, getSlotFromDate } from "~/shared/helpers/tracker";
import { format } from "date-fns";

type CalendarWeekViewProps = {
  weekDays: TZDate[];
  currentDate: TZDate;
  selectedDate: string | null;
  data: RouterOutput["recurringEntry"]["byRange"]["result"] | undefined;
  range: [string, string] | null;
  localRange: [string | null, string | null];
  isDragging: boolean;
  weekStartsOnMonday: boolean;
  handleMouseDown: (date: TZDate) => void;
  handleMouseEnter: (date: TZDate) => void;
  handleMouseUp: () => void;
  onEventClick?: (eventId: string, date: TZDate) => void;
};

const SLOT_HEIGHT = 6.5;
const HOUR_HEIGHT = 100; // Fill the available height (600px - header) / 24 hours ≈ 26px

type ProcessedEntry = {
  event: NonNullable<
    RouterOutput["recurringEntry"]["byRange"]["result"]
  >[string][number];
  eventIndex: string | number;
  displaySlot: number;
  isFromCurrentDay: boolean;
};

type PositionedEntry = ProcessedEntry & {
  column: number;
  totalColumns: number;
  width: number;
  left: number;
  leftPx?: number; // For pixel-based left positioning in cascading layout
};

/**
 * Detect if two events overlap in time
 */
const eventsOverlap = (
  event1: ProcessedEntry,
  event2: ProcessedEntry,
): boolean => {
  return (
    event1.displaySlot < event2.displaySlot &&
    event2.displaySlot < event1.displaySlot
  );
};

/**
 * Group overlapping events and calculate positioning
 * Optimized: Memoized and optimized for performance
 */
const calculateEventPositions = (
  entries: ProcessedEntry[],
): PositionedEntry[] => {
  if (entries.length === 0) return [];

  // Sort events by start time, then by duration (longer events first)
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.displaySlot !== b.displaySlot) {
      return a.displaySlot - b.displaySlot;
    }
    // If start times are the same, put longer events first
    return b.displaySlot - -a.displaySlot;
  });

  // Build overlap groups using a more robust algorithm
  const overlapGroups: ProcessedEntry[][] = [];
  const processed = new Set<ProcessedEntry>();

  for (const entry of sortedEntries) {
    if (processed.has(entry)) continue;

    // Start a new group with this entry
    const currentGroup: ProcessedEntry[] = [entry];
    processed.add(entry);

    // Keep expanding the group until no more overlaps are found
    let foundNewOverlap = true;
    while (foundNewOverlap) {
      foundNewOverlap = false;

      for (const candidate of sortedEntries) {
        if (processed.has(candidate)) continue;

        // Check if this candidate overlaps with ANY event in the current group
        const overlapsWithGroup = currentGroup.some((groupEntry) =>
          eventsOverlap(candidate, groupEntry),
        );

        if (overlapsWithGroup) {
          currentGroup.push(candidate);
          processed.add(candidate);
          foundNewOverlap = true;
          // Don't break here - keep checking other candidates in this iteration
        }
      }
    }

    overlapGroups.push(currentGroup);
  }

  const positionedEntries: PositionedEntry[] = [];

  // Process each overlap group separately
  for (const group of overlapGroups) {
    if (group.length === 1) {
      // Single event - no overlap, use full width
      const entry = group[0];
      if (entry) {
        positionedEntries.push({
          ...entry,
          column: 0,
          totalColumns: 1,
          width: 100,
          left: 0,
        });
      }
    } else {
      // Multiple overlapping events - use cascading/staggered layout

      // Sort group by start time for proper stacking order
      const sortedGroup = [...group].sort((a, b) => {
        if (a.displaySlot !== b.displaySlot) {
          return a.displaySlot - b.displaySlot;
        }
        return b.displaySlot - -a.displaySlot;
      });

      sortedGroup.forEach((entry, index) => {
        // Cascading layout parameters
        const offsetStep = 8; // Pixels to offset each event
        const baseWidth = 80; // Width for overlapping events (not the base)
        const widthReduction = 3; // How much to reduce width for each subsequent event

        // Calculate cascading properties
        const totalEvents = sortedGroup.length;

        // First event (index 0) gets full width, others get progressively smaller
        const width =
          index === 0
            ? 100
            : Math.max(60, baseWidth - (index - 1) * widthReduction);

        // Each event is offset to the right (except the first one)
        const leftOffset = index * offsetStep;
        const left = leftOffset;

        positionedEntries.push({
          ...entry,
          column: index,
          totalColumns: totalEvents,
          width,
          left,
          // Add a custom property for pixel-based left positioning
          leftPx: leftOffset,
        });
      });
    }
  }

  return positionedEntries;
};

// Optimized: Create memoized component for day entries to prevent unnecessary re-renders
const DayEntries = memo(
  ({
    day,
    data,
    user,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    onEventClick,
  }: {
    day: TZDate;
    data: RouterOutput["recurringEntry"]["byRange"]["result"] | undefined;
    user: RouterOutput["user"]["me"] | undefined;
    handleMouseDown: (date: TZDate) => void;
    handleMouseEnter: (date: TZDate) => void;
    handleMouseUp: () => void;
    onEventClick?: (eventId: string, date: TZDate) => void;
  }) => {
    // Memoize the processed entries to prevent recalculation on every render
    const positionedEntries = useMemo(() => {
      const currentDayStr = format(day, "yyyy-MM-dd");
      const dayData = data?.[currentDayStr] ?? [];
      const allEntries: ProcessedEntry[] = [];

      // Add entries for current day
      dayData.forEach((event, eventIndex) => {
        const date = createSafeDate(event.date);

        // Convert UTC times to user timezone for display slot calculation
        const displayTimezone = user?.timezone ?? "UTC";
        let dateSlot: number;

        if (displayTimezone !== "UTC") {
          try {
            const dateInUserTz = new TZDate(date, displayTimezone);
            dateSlot = getSlotFromDate(dateInUserTz);
          } catch {
            // Fallback with timezone parameter if timezone conversion fails
            dateSlot = getSlotFromDate(date, displayTimezone);
          }
        } else {
          dateSlot = getSlotFromDate(date, displayTimezone);
        }

        allEntries.push({
          event,
          eventIndex,
          displaySlot: dateSlot,
          isFromCurrentDay: true,
        });
      });

      // Calculate positions for overlapping events
      return calculateEventPositions(allEntries);
    }, [day, data, user?.timezone]);

    return (
      <>
        {positionedEntries.map((entry) => {
          const top = 0;
          const height = SLOT_HEIGHT;

          const handleEventClick = () => {
            // Normal event click behavior - select the event if we have onEventClick
            if (onEventClick) {
              onEventClick(entry.event.id, day);
            } else {
              // Fallback to just selecting the day
              handleMouseDown(day);
            }
          };

          return (
            <div
              key={`${entry.event.id}-${entry.eventIndex}`}
              className={cn(
                "absolute cursor-pointer overflow-hidden p-2 text-xs transition-colors",
                // Same styling for all events
                "bg-[#F0F0F0] text-[#606060] hover:bg-[#E8E8E8] dark:bg-[#1D1D1D] dark:text-[#878787] dark:hover:bg-[#252525]",
                entry.totalColumns > 1 && entry.column > 0
                  ? "border border-border"
                  : "",
              )}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                left:
                  entry.leftPx !== undefined
                    ? `${entry.leftPx}px`
                    : `${entry.left}%`,
                width:
                  entry.leftPx !== undefined
                    ? `calc(${entry.width}% - ${entry.leftPx}px)`
                    : `${entry.width}%`,
                zIndex: entry.totalColumns > 1 ? 20 + entry.column : 10,
              }}
              onMouseDown={handleEventClick}
              onMouseEnter={() => {
                handleMouseEnter(day);
              }}
              // onMouseLeave={() => {}}
              onMouseUp={handleMouseUp}
              data-event-id={entry.event.id}
            >
              <div className="flex items-center gap-1 truncate leading-tight font-medium">
                <span className="truncate">
                  {entry.event.name || "No Project"}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  },
);

DayEntries.displayName = "DayEntries";

// Optimized: Main component with memoization
export const CalendarWeekView = memo(
  ({
    weekDays,
    currentDate,
    data,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    onEventClick,
  }: CalendarWeekViewProps) => {
    const { data: user } = useUserQuery();

    return (
      <div className="flex flex-col border border-b-0 border-border">
        <div
          className="grid-col grid gap-px border-b border-border bg-border"
          style={{
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {/* Day headers - name and date on same row */}
          {weekDays.map((day) => (
            <div
              key={`header-${day.toString()}`}
              className="bg-background px-2 py-4 text-center font-mono text-xs font-medium text-[#878787]"
            >
              <div className="flex flex-row items-end justify-center gap-2">
                <span className="uppercase">{format(day, "EEE")}</span>
                <span className="font-medium text-foreground">
                  {format(day, "d")}
                </span>
                {day.getMonth() !== currentDate.getMonth() && (
                  <span className="text-[#878787] text-[[10px] uppercase">
                    {format(day, "MMM")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid and events */}
        <div
          className="grid flex-1 gap-px bg-border"
          style={{
            gridTemplateColumns: "repeat(7, 1fr)",
          }}
        >
          {/* Days columns */}
          {weekDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");

            return (
              <div key={dayKey} className="relative bg-background">
                {/* Hour grid lines */}
                <div
                  key={`${dayKey}`}
                  className={cn(
                    "group relative cursor-pointer border-b border-border transition-colors hover:bg-muted/10",
                  )}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  onMouseDown={() => handleMouseDown(day)}
                  onMouseEnter={() => handleMouseEnter(day)}
                  onMouseUp={handleMouseUp}
                >
                  {/* Hour hover indicator */}
                  <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100" />

                  {/* Time indicator on hover */}
                  <div className="pointer-events-none absolute top-0.5 left-1 rounded bg-background/80 px-1 font-mono text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                    {/* {formatHour(hour, user?.timeFormat)} */}
                  </div>
                </div>

                {/* Events for this day */}
                <DayEntries
                  day={day}
                  data={data}
                  user={user}
                  handleMouseDown={handleMouseDown}
                  handleMouseEnter={handleMouseEnter}
                  handleMouseUp={handleMouseUp}
                  onEventClick={onEventClick}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

CalendarWeekView.displayName = "CalendarWeekView";
