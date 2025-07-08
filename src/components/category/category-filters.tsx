"use client";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getWeekOfMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { type DateRange } from "react-day-picker";

import { categoriesFiltersParsers } from "../../features/category/utils/search-params";
import { DateRangePicker } from "../custom/date-range-picker";

export const CategoryFilters = () => {
  const [filters, setFilters] = useQueryStates(categoriesFiltersParsers, {
    shallow: false,
  });

  const getDisplayText = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) {
      return "Select date";
    }

    const { from, to } = range;

    // Check if entire year is selected
    const yearStart = startOfYear(from);
    const yearEnd = endOfYear(from);
    if (isSameDay(from, yearStart) && isSameDay(to, yearEnd)) {
      return format(from, "yyyy");
    }

    // Check if entire month is selected
    const monthStart = startOfMonth(from);
    const monthEnd = endOfMonth(from);
    if (isSameDay(from, monthStart) && isSameDay(to, monthEnd)) {
      return format(from, "MMMM yyyy");
    }

    // Check if entire week is selected
    const weekStart = startOfWeek(from, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(from, { weekStartsOn: 1 });
    if (isSameDay(from, weekStart) && isSameDay(to, weekEnd)) {
      const weekNumber = getWeekOfMonth(from, { weekStartsOn: 1 });
      const ordinal =
        weekNumber === 1
          ? "1st"
          : weekNumber === 2
            ? "2nd"
            : weekNumber === 3
              ? "3rd"
              : `${weekNumber}th`;
      return `${ordinal} week of ${format(from, "MMMM yyyy")}`;
    }

    // Default behavior for partial periods
    return `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`;
  };

  const handleDateRangeChange = (dateRange?: DateRange) => {
    void setFilters({ ...dateRange });
  };

  return (
    <div className="flex items-center gap-2 px-4">
      <DateRangePicker />
      {/* <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dates"
            className="w-40 justify-center text-sm font-normal"
            size="sm"
          >
            {getDisplayText(filters)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="range"
            selected={filters}
            captionLayout="dropdown"
            onSelect={handleDateRangeChange}
          />
        </PopoverContent>
      </Popover> */}
    </div>
  );
};
