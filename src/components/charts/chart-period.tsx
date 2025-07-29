"use client";

import type { DateRange } from "react-day-picker";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMetricsParams } from "~/hooks/use-metrics-params";
import { chartPeriodOptions } from "~/shared/validators/metrics.schema";
import { formatISO } from "date-fns";
import { formatDateRange } from "little-date";
import { ChevronDownIcon } from "lucide-react";

type Props = {
  disabled?: string;
};

export function ChartPeriod({ disabled }: Props) {
  const { params, setParams } = useMetricsParams();

  const handleChangePeriod = (
    range: DateRange | undefined,
    period?: string,
  ) => {
    const newRange = {
      from: range?.from
        ? formatISO(range.from, { representation: "date" })
        : params.from,
      to: range?.to
        ? formatISO(range.to, { representation: "date" })
        : params.to,
      period: period ?? params.period,
    };

    void setParams(newRange);
  };

  // Handle calendar selection separately to match the expected type
  const handleCalendarSelect = (selectedRange: DateRange | undefined) => {
    handleChangePeriod(selectedRange);
  };

  return (
    <div className="flex space-x-4">
      <Popover>
        <PopoverTrigger asChild disabled={Boolean(disabled)}>
          <Button
            variant="outline"
            className="justify-start space-x-2 text-left font-medium"
          >
            <span className="line-clamp-1 text-ellipsis">
              {params.from && params.to
                ? formatDateRange(new Date(params.from), new Date(params.to), {
                    includeTime: false,
                  })
                : "Select date range"}
            </span>
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-screen flex-col space-y-4 p-0 md:w-[490px]"
          align="end"
          sideOffset={10}
        >
          <div className="mb-0 p-4 pb-0">
            <Select
              value={params.period ?? undefined}
              onValueChange={(value) =>
                handleChangePeriod(
                  chartPeriodOptions.find((p) => p.value === value)?.range,
                  value,
                )
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a period" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {chartPeriodOptions.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{
              from: params.from ? new Date(params.from) : undefined,
              to: params.to ? new Date(params.to) : undefined,
            }}
            defaultMonth={
              params.from
                ? new Date(params.from)
                : new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
            initialFocus
            toDate={new Date()}
            onSelect={handleCalendarSelect}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
