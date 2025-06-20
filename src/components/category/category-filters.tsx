"use client";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useCategoryParams } from "~/hooks/use-category-params";
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
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { type DateRange } from "react-day-picker";

import { categoriesFiltersParsers } from "../../features/category/utils/search-params";

export const CategoryFilters = () => {
  const { params, setParams } = useCategoryParams();
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
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="dates"
            className="w-56 justify-between font-normal"
          >
            {getDisplayText(filters)}
            <ChevronDownIcon />
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
      </Popover>
      <Button onClick={() => void setParams({ createCategory: true })}>
        <PlusIcon className="size-4" />
        Crea
      </Button>
    </div>
  );
};
