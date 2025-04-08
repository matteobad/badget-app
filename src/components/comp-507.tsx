import { useState } from "react";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { type DateRange } from "react-day-picker";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";

export default function Component({
  handleChange,
}: {
  handleChange: (dateRange?: DateRange) => void;
}) {
  const today = new Date();
  const yesterday = {
    from: subDays(today, 1),
    to: subDays(today, 1),
  };
  const last7Days = {
    from: subDays(today, 6),
    to: today,
  };
  const last30Days = {
    from: subDays(today, 29),
    to: today,
  };
  const monthToDate = {
    from: startOfMonth(today),
    to: today,
  };
  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1)),
  };
  const yearToDate = {
    from: startOfYear(today),
    to: today,
  };
  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1)),
  };
  const [month, setMonth] = useState(today);
  const [date, setDate] = useState<DateRange | undefined>(last7Days);

  return (
    <div className="flex max-sm:flex-col">
      <div className="relative py-4 max-sm:order-1 max-sm:border-t sm:w-32">
        <div className="h-full sm:border-e">
          <div className="flex flex-col px-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate({
                  from: today,
                  to: today,
                });
                setMonth(today);
              }}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(yesterday);
                setMonth(yesterday.to);
              }}
            >
              Yesterday
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(last7Days);
                setMonth(last7Days.to);
              }}
            >
              Last Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(last30Days);
                setMonth(last30Days.to);
              }}
            >
              Current Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(monthToDate);
                setMonth(monthToDate.to);
              }}
            >
              Last Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(lastMonth);
                setMonth(lastMonth.to);
              }}
            >
              Current Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(yearToDate);
                setMonth(yearToDate.to);
              }}
            >
              Last Year
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-xs"
              onClick={() => {
                setDate(lastYear);
                setMonth(lastYear.to);
              }}
            >
              Current Year
            </Button>
          </div>
        </div>
      </div>
      <Calendar
        mode="range"
        selected={date}
        onSelect={(newDate) => {
          if (newDate) {
            setDate(newDate);
            handleChange(newDate);
          }
        }}
        month={month}
        onMonthChange={setMonth}
        className="p-4"
      />
    </div>
  );
}
