import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type React from "react";
import { useCallback } from "react";
import { TZDate } from "@date-fns/tz";
import { cn } from "~/lib/utils";
import { format, formatISO, isToday } from "date-fns";

import {
  checkIsFirstSelectedDate,
  checkIsInRange,
  checkIsLastSelectedDate,
} from "../utils";
import { TrackerEvents } from "./tracker-events";

type CalendarDayProps = {
  date: TZDate;
  currentDate: TZDate;
  selectedDate: string | null;
  dayData:
    | RouterOutput["recurringEntry"]["byRange"]["result"][string]
    | undefined;
  allData?: RouterOutput["recurringEntry"]["byRange"]["result"];
  range: [string, string] | null;
  localRange: [string | null, string | null];
  isDragging: boolean;
  handleMouseDown: (date: TZDate) => void;
  handleMouseEnter: (date: TZDate) => void;
  handleMouseUp: () => void;
  onEventClick?: (eventId: string, date: TZDate) => void;
};

export function CalendarDay({
  date,
  currentDate,
  selectedDate,
  allData,
  range,
  localRange,
  isDragging,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  onEventClick,
}: CalendarDayProps) {
  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
  const formattedDate = formatISO(date, { representation: "date" });

  const isInRange = useCallback(
    (date: TZDate) => checkIsInRange(date, isDragging, localRange, range),
    [isDragging, localRange, range],
  );

  const isFirstSelectedDate = useCallback(
    (date: TZDate) =>
      checkIsFirstSelectedDate(date, isDragging, localRange, range),
    [isDragging, localRange, range],
  );

  const isLastSelectedDate = useCallback(
    (date: TZDate) =>
      checkIsLastSelectedDate(date, isDragging, localRange, range),
    [isDragging, localRange, range],
  );

  const handleDayClick = (event: React.MouseEvent) => {
    // Check if the click target is a continuation event
    const target = event.target as HTMLElement;
    const isContinuation = target.closest('[data-is-continuation="true"]');
    const eventTarget = target.closest("[data-event-id]");

    if (isContinuation) {
      // If this is a continuation event, select the previous day
      event.preventDefault();
      event.stopPropagation();
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      const previousDayTZ = new TZDate(previousDay, "UTC");
      handleMouseDown(previousDayTZ);
    } else if (eventTarget && onEventClick) {
      // Handle event click on current day
      const eventId = eventTarget.getAttribute("data-event-id");
      if (eventId) {
        event.preventDefault();
        event.stopPropagation();
        onEventClick(eventId, date);
        return;
      }
    } else {
      // Normal behavior - select current day (including for "show all events" clicks)
      handleMouseDown(date);
    }
  };

  return (
    <div
      onMouseDown={handleDayClick}
      onMouseEnter={() => handleMouseEnter(date)}
      onMouseUp={handleMouseUp}
      className={cn(
        "relative flex aspect-square space-x-2 px-3 pt-2 pb-10 text-left font-mono text-lg transition-all duration-100 select-none md:aspect-[4/2]",
        isCurrentMonth && isToday(date)
          ? "bg-[#f0f0f0] dark:bg-[#202020]"
          : "bg-background",
        !isCurrentMonth &&
          "bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] text-[#878787] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]",
        selectedDate === formattedDate && "ring-1 ring-primary",
        isInRange(date) && "bg-opacity-50 ring-1 ring-primary",
        isFirstSelectedDate(date) && "bg-opacity-50 ring-1 ring-primary",
        isLastSelectedDate(date) && "bg-opacity-50 ring-1 ring-primary",
      )}
    >
      <div>{format(date, "d")}</div>
      <TrackerEvents
        isToday={isToday(date)}
        allData={allData}
        currentDate={date}
        onEventClick={onEventClick}
      />
    </div>
  );
}
