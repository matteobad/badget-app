"use client";

import * as React from "react";
import { type Column } from "@tanstack/react-table";
import { XIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Badge } from "~/components/ui/badge";
import { Calendar } from "~/components/ui/calendar";
import { type PopoverContent } from "~/components/ui/popover";

const dateTimeFormat = new Intl.DateTimeFormat("it", {
  year: "2-digit",
  month: "numeric",
  day: "numeric",
});

interface DateFilterProps<TData, TValue>
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  column: Column<TData, TValue>;
}

export function DateFilter<TData, TValue>({
  column,
}: DateFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue();

  const selected = React.useMemo<DateRange | undefined>(() => {
    function parseDate(dateString?: string) {
      if (!dateString) return undefined;
      const parsedDate = new Date(dateString);
      return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    return Array.isArray(unknownValue)
      ? {
          from: parseDate(unknownValue[0] as string),
          ...(!!unknownValue[1] && {
            to: parseDate(unknownValue[1] as string),
          }),
        }
      : undefined;
  }, [unknownValue]);

  return (
    <div className="grid gap-2">
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={selected?.from}
        selected={selected}
        onSelect={(newDateRange) => {
          column.setFilterValue(
            newDateRange
              ? [
                  newDateRange.from?.toISOString() ?? "",
                  newDateRange.to?.toISOString() ?? "",
                ]
              : undefined,
          );
        }}
        numberOfMonths={1}
      />
    </div>
  );
}

export function DateFilterFaceted<TData, TValue>({
  column,
}: DateFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue();

  const selected = React.useMemo<DateRange | undefined>(() => {
    function parseDate(dateString?: string) {
      if (!dateString) return undefined;
      const parsedDate = new Date(dateString);
      return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }
    return Array.isArray(unknownValue)
      ? {
          from: parseDate(unknownValue[0] as string),
          ...(!!unknownValue[1] && {
            to: parseDate(unknownValue[1] as string),
          }),
        }
      : undefined;
  }, [unknownValue]);

  if (!selected?.from) return;

  return (
    <Badge
      variant="secondary"
      className="group rounded-sm p-1.5 px-2 font-normal"
      onClick={() => column?.setFilterValue(undefined)}
    >
      {selected.to ? (
        <span>{dateTimeFormat.formatRange(selected.from, selected.to)}</span>
      ) : (
        <span>{dateTimeFormat.format(selected.from)}</span>
      )}

      <XIcon className="" />
    </Badge>
  );
}
