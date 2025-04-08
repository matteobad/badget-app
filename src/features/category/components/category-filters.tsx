"use client";

import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { type DateRange } from "react-day-picker";

import Component from "~/components/comp-507";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { categoriesFiltersParsers } from "../utils/search-params";

export const CategoryFilters = () => {
  const [{ from }, setFilters] = useQueryStates(categoriesFiltersParsers, {
    shallow: false,
  });

  const handleDateRangeChange = (dateRange?: DateRange) => {
    void setFilters({ ...dateRange });
  };

  return (
    <div className="flex items-center justify-between">
      {/* <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void setFilters({
              date: new Date(),
              period: BUDGET_PERIOD.MONTHLY,
            });
          }}
        >
          Current
        </Button>
        <div className="flex items-center sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => {
              const value = handleDateChange(-1);
              console.log("change", value);
              void setFilters({ date: value, period });
            }}
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() => {
              const value = handleDateChange(1);
              void setFilters({ date: value, period });
            }}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="text-sm font-semibold whitespace-nowrap sm:text-lg md:text-xl">
          {format(date, "LLLL yyyy")}
        </div>
      </div> */}
      <div className="flex w-full items-center justify-end gap-2">
        <Popover>
          <PopoverTrigger>
            <Button
              variant={"outline"}
              className={cn(
                "w-auto justify-start text-left font-normal",
                !from && "text-muted-foreground",
              )}
            >
              <CalendarIcon />
              {from ? format(from, "LLLL yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-fit p-0">
            <Component handleChange={handleDateRangeChange} />
          </PopoverContent>
        </Popover>
        <Button size="sm">
          <PlusIcon className="size-4" />
          Crea
        </Button>
      </div>
    </div>
  );
};
