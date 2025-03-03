"use client";

import type { DateRange } from "react-day-picker";
import * as React from "react";
import { parseAsString, useQueryStates } from "nuqs";

import type { ButtonProps } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { type PopoverContent } from "~/components/ui/popover";

interface DateFilterProps
  extends React.ComponentPropsWithoutRef<typeof PopoverContent> {
  /**
   * The selected date range.
   * @default undefined
   * @type DateRange
   * @example { from: new Date(), to: new Date() }
   */
  defaultDateRange?: DateRange;

  /**
   * The placeholder text of the calendar trigger button.
   * @default "Pick a date"
   * @type string | undefined
   */
  placeholder?: string;

  /**
   * The variant of the calendar trigger button.
   * @default "outline"
   * @type "default" | "outline" | "secondary" | "ghost"
   */
  triggerVariant?: Exclude<ButtonProps["variant"], "destructive" | "link">;

  /**
   * The size of the calendar trigger button.
   * @default "default"
   * @type "default" | "sm" | "lg"
   */
  triggerSize?: Exclude<ButtonProps["size"], "icon">;

  /**
   * The class name of the calendar trigger button.
   * @default undefined
   * @type string
   */
  triggerClassName?: string;

  /**
   * Controls whether query states are updated client-side only (default: true).
   * Setting to `false` triggers a network request to update the querystring.
   * @default true
   */
  shallow?: boolean;
}

export function DateFilter({
  defaultDateRange,
  shallow = false,
}: DateFilterProps) {
  const [dateParams, setDateParams] = useQueryStates(
    {
      from: parseAsString.withDefault(
        defaultDateRange?.from?.toISOString() ?? "",
      ),
      to: parseAsString.withDefault(defaultDateRange?.to?.toISOString() ?? ""),
    },
    {
      clearOnDefault: true,
      shallow,
    },
  );

  const date = React.useMemo(() => {
    function parseDate(dateString: string | null) {
      if (!dateString) return undefined;
      const parsedDate = new Date(dateString);
      return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
    }

    return {
      from: parseDate(dateParams.from) ?? defaultDateRange?.from,
      to: parseDate(dateParams.to) ?? defaultDateRange?.to,
    };
  }, [dateParams, defaultDateRange]);

  return (
    <div className="grid gap-2">
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={(newDateRange) => {
          void setDateParams({
            from: newDateRange?.from?.toISOString() ?? "",
            to: newDateRange?.to?.toISOString() ?? "",
          });
        }}
        numberOfMonths={1}
      />
    </div>
  );
}
