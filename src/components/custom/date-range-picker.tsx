"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import {
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  eachWeekOfInterval,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  isSameMonth,
  isSameQuarter,
  isSameWeek,
  isSameYear,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

type PickerMode = "month" | "week" | "quarter" | "year" | "custom";

interface DateRange {
  from: Date;
  to: Date;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const QUARTERS = [
  { label: "Q1", months: "Jan - Mar" },
  { label: "Q2", months: "Apr - Jun" },
  { label: "Q3", months: "Jul - Sep" },
  { label: "Q4", months: "Oct - Dec" },
];

function MonthPicker({
  selectedDate,
  onSelect,
  currentYear,
  onYearChange,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  currentYear: number;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(currentYear - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-semibold">{currentYear}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(currentYear + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => {
          const monthDate = new Date(currentYear, index, 1);
          const isSelected = isSameMonth(selectedDate, monthDate);
          return (
            <Button
              key={month}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className="h-10"
              onClick={() => onSelect(monthDate)}
            >
              {month.slice(0, 3)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function QuarterPicker({
  selectedDate,
  onSelect,
  currentYear,
  onYearChange,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  currentYear: number;
  onYearChange: (year: number) => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(currentYear - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-semibold">{currentYear}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onYearChange(currentYear + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {QUARTERS.map((quarter, index) => {
          const quarterDate = new Date(currentYear, index * 3, 1);
          const isSelected = isSameQuarter(selectedDate, quarterDate);
          return (
            <Button
              key={quarter.label}
              variant={isSelected ? "default" : "ghost"}
              className="flex h-16 flex-col"
              onClick={() => onSelect(quarterDate)}
            >
              <div className="font-semibold">{quarter.label}</div>
              <div className="text-xs text-muted-foreground">
                {quarter.months}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function YearPicker({
  selectedDate,
  onSelect,
  startYear,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  startYear: number;
}) {
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-2">
        {years.map((year) => {
          const yearDate = new Date(year, 0, 1);
          const isSelected = isSameYear(selectedDate, yearDate);
          return (
            <Button
              key={year}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              className="h-10"
              onClick={() => onSelect(yearDate)}
            >
              {year}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function WeekPicker({
  selectedDate,
  onSelect,
  currentMonth,
  onMonthChange,
}: {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const weeks = eachWeekOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(addMonths(currentMonth, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-semibold">{format(currentMonth, "MMMM yyyy")}</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="mb-2 text-sm text-muted-foreground">Select a week:</div>
        {weeks.map((weekStart, index) => {
          const weekEnd = endOfWeek(weekStart);
          const isSelected = isSameWeek(selectedDate, weekStart);
          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "ghost"}
              className="h-auto w-full justify-start p-3"
              onClick={() => onSelect(weekStart)}
            >
              <div className="flex flex-col items-start">
                <div className="font-medium">Week {index + 1}</div>
                <div className="text-xs text-muted-foreground">
                  {format(weekStart, "MMM d")} -{" "}
                  {format(weekEnd, "MMM d, yyyy")}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function formatDateRange(range: DateRange | undefined, mode: PickerMode) {
  if (!range) return "";

  const { from, to } = range;

  switch (mode) {
    case "month":
      return format(from, "MMMM yyyy");
    case "week":
      return `Week of ${format(from, "MMM d, yyyy")}`;
    case "quarter":
      const quarter = Math.floor(from.getMonth() / 3) + 1;
      return `Q${quarter} ${format(from, "yyyy")}`;
    case "year":
      return format(from, "yyyy");
    case "custom":
      if (from.getTime() === to.getTime()) {
        return format(from, "MMM d, yyyy");
      }
      return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
    default:
      return `${format(from, "MMM d, yyyy")} - ${format(to, "MMM d, yyyy")}`;
  }
}

function navigateRange(
  currentRange: DateRange,
  mode: PickerMode,
  direction: "prev" | "next",
): DateRange {
  const multiplier = direction === "next" ? 1 : -1;

  switch (mode) {
    case "month":
      const newMonth = addMonths(currentRange.from, multiplier);
      return { from: startOfMonth(newMonth), to: endOfMonth(newMonth) };
    case "week":
      const newWeek = addWeeks(currentRange.from, multiplier);
      return { from: startOfWeek(newWeek), to: endOfWeek(newWeek) };
    case "quarter":
      const newQuarter = addQuarters(currentRange.from, multiplier);
      return { from: startOfQuarter(newQuarter), to: endOfQuarter(newQuarter) };
    case "year":
      const newYear = addYears(currentRange.from, multiplier);
      return { from: startOfYear(newYear), to: endOfYear(newYear) };
    default:
      return currentRange;
  }
}

export function DateRangePicker() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [mode, setMode] = React.useState<PickerMode>("month");
  const [dateRange, setDateRange] = React.useState<DateRange>(() => {
    const now = new Date();
    return { from: startOfMonth(now), to: endOfMonth(now) };
  });

  const { filter, setFilter } = useBudgetFilterParams();

  // State for picker navigation
  const [currentYear, setCurrentYear] = React.useState(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = React.useState(() => new Date());
  const [yearPickerStart, setYearPickerStart] = React.useState(() => {
    const currentYear = new Date().getFullYear();
    return Math.floor(currentYear / 12) * 12;
  });

  React.useEffect(() => {
    setValue(formatDateRange(dateRange, mode));
  }, [dateRange, mode]);

  const handleNavigation = (direction: "prev" | "next") => {
    const newRange = navigateRange(dateRange, mode, direction);
    setDateRange(newRange);
    void setFilter({ from: newRange.from, to: newRange.to });
  };

  const handleModeChange = (newMode: PickerMode) => {
    setMode(newMode);
    const now = new Date();

    switch (newMode) {
      case "month":
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        void setFilter({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "week":
        setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
        break;
      case "quarter":
        setDateRange({ from: startOfQuarter(now), to: endOfQuarter(now) });
        break;
      case "year":
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
      case "custom":
        setDateRange({ from: now, to: now });
        break;
    }
  };

  const handlePickerSelect = (selectedDate: Date) => {
    switch (mode) {
      case "month":
        setDateRange({
          from: startOfMonth(selectedDate),
          to: endOfMonth(selectedDate),
        });
        break;
      case "week":
        setDateRange({
          from: startOfWeek(selectedDate),
          to: endOfWeek(selectedDate),
        });
        break;
      case "quarter":
        setDateRange({
          from: startOfQuarter(selectedDate),
          to: endOfQuarter(selectedDate),
        });
        break;
      case "year":
        setDateRange({
          from: startOfYear(selectedDate),
          to: endOfYear(selectedDate),
        });
        break;
      case "custom":
        setDateRange({ from: selectedDate, to: selectedDate });
        break;
    }
    setOpen(false);
  };

  const renderPicker = () => {
    switch (mode) {
      case "month":
        return (
          <MonthPicker
            selectedDate={dateRange.from}
            onSelect={handlePickerSelect}
            currentYear={currentYear}
            onYearChange={setCurrentYear}
          />
        );
      case "quarter":
        return (
          <QuarterPicker
            selectedDate={dateRange.from}
            onSelect={handlePickerSelect}
            currentYear={currentYear}
            onYearChange={setCurrentYear}
          />
        );
      case "year":
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setYearPickerStart(yearPickerStart - 12)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="font-semibold">
                {yearPickerStart} - {yearPickerStart + 11}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setYearPickerStart(yearPickerStart + 12)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <YearPicker
              selectedDate={dateRange.from}
              onSelect={handlePickerSelect}
              startYear={yearPickerStart}
            />
          </div>
        );
      case "week":
        return (
          <WeekPicker
            selectedDate={dateRange.from}
            onSelect={handlePickerSelect}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        );
      case "custom":
        return (
          <div className="p-0">
            <Calendar
              mode="single"
              selected={dateRange.from}
              captionLayout="dropdown"
              onSelect={(date) => date && handlePickerSelect(date)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="sr-only px-1">
        Schedule Date Range
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="July, current week, or tomorrow"
          className="h-8 bg-background pr-16 text-sm"
          onChange={(e) => console.log(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />

        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0"
            onClick={() => handleNavigation("prev")}
          >
            <ChevronLeft className="size-3" />
            <span className="sr-only">Previous range</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0"
            onClick={() => handleNavigation("next")}
          >
            <ChevronRight className="size-3" />
            <span className="sr-only">Next range</span>
          </Button>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date-picker"
                variant="ghost"
                size="sm"
                className="size-6 p-0"
              >
                <CalendarIcon className="size-3" />
                <span className="sr-only">Select date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <div className="border-b bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)} Picker
                  </div>
                  <Select value={mode} onValueChange={handleModeChange}>
                    <SelectTrigger className="h-7 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="quarter">Quarter</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  {mode === "custom"
                    ? "Select any date for custom range"
                    : `Select a ${mode} from the options below`}
                </div>
              </div>
              {renderPicker()}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
