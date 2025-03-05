"use client";

import React, { useId, useMemo } from "react";
import { type Column } from "@tanstack/react-table";
import { XIcon } from "lucide-react";

import { CurrencyInput } from "~/components/custom/currency-input";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { useSliderWithInput } from "~/hooks/use-slider-with-input";
import { type DB_TransactionType } from "~/server/db/schema/transactions";

const numberFormat = new Intl.NumberFormat("it", {
  currency: "EUR",
});

type NumberRange = {
  min: number | undefined;
  max?: number | undefined;
};

interface NumberFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  data: TData[];
}

export default function NumberFilter<TData, TValue>({
  column,
  data,
}: NumberFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue();

  const selected = useMemo<NumberRange | undefined>(() => {
    function parseNumber(numberString?: string) {
      if (!numberString) return undefined;
      const parsedNumber = parseFloat(numberString);
      return Number.isNaN(parsedNumber) ? undefined : parsedNumber;
    }
    return Array.isArray(unknownValue)
      ? {
          min: parseNumber(unknownValue[0] as string),
          ...(!!unknownValue[1] && {
            max: parseNumber(unknownValue[1] as string),
          }),
        }
      : undefined;
  }, [unknownValue]);

  const id = useId();

  // Define the number of ticks
  const tick_count = 40;
  // Find the min and max values across all items
  const items = data?.map((t) => (t as DB_TransactionType).amount) ?? [];
  const minValue = Math.min(...items.map((item) => parseFloat(item)));
  const maxValue = Math.max(...items.map((item) => parseFloat(item)));

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({
    minValue,
    maxValue,
    initialValue: [selected?.min ?? minValue, selected?.max ?? maxValue],
  }); // set initialValue: [minValue, maxValue] to show all items by default

  // Calculate the price step based on the min and max prices
  const priceStep = (maxValue - minValue) / tick_count;

  // Calculate item counts for each price range
  const itemCounts = Array(tick_count)
    .fill(0)
    .map((_, tick) => {
      const rangeMin = minValue + tick * priceStep;
      const rangeMax = minValue + (tick + 1) * priceStep;
      return items.filter(
        (item) => parseFloat(item) >= rangeMin && parseFloat(item) < rangeMax,
      ).length;
    });

  // Find maximum count for scaling
  const maxCount = Math.max(...itemCounts);

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values);
  };

  // Function to count items in the selected range
  const countItemsInRange = (min: number, max: number) => {
    return items.filter(
      (item) => parseFloat(item) >= min && parseFloat(item) <= max,
    ).length;
  };

  const isBarInSelectedRange = (
    index: number,
    minValue: number,
    priceStep: number,
    sliderValue: number[],
  ) => {
    const rangeMin = minValue + index * priceStep;
    const rangeMax = minValue + (index + 1) * priceStep;
    return (
      countItemsInRange(sliderValue[0]!, sliderValue[1]!) > 0 &&
      rangeMin <= sliderValue[1]! &&
      rangeMax >= sliderValue[0]!
    );
  };

  return (
    <div className="flex w-64 flex-col gap-2 p-2">
      <Label className="sr-only">Price slider</Label>
      <div>
        {/* Histogram bars */}
        <div className="flex h-12 w-full items-end px-3" aria-hidden="true">
          {itemCounts.map((count, i) => (
            <div
              key={i}
              className="flex flex-1 justify-center"
              style={{
                height: `${(count / maxCount) * 100}%`,
              }}
            >
              <span
                data-selected={isBarInSelectedRange(
                  i,
                  minValue,
                  priceStep,
                  sliderValue,
                )}
                className="h-full w-full bg-primary/20"
              ></span>
            </div>
          ))}
        </div>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          min={minValue}
          max={maxValue}
          aria-label="Price range"
        />
      </div>

      {/* Inputs */}
      <div className="flex items-center justify-between gap-2">
        <div className="*:not-first:mt-1">
          <Label htmlFor={`${id}-min`} className="text-xs">
            Importo minimo
          </Label>
          <div className="relative">
            <CurrencyInput
              id={`${id}-min`}
              value={inputValues[0]}
              onChange={(e) => handleInputChange(e, 0)}
              onBlur={() => validateAndUpdateValue(inputValues[0]!, 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndUpdateValue(inputValues[0]!, 0);
                }
              }}
            />

            <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
              €
            </span>
          </div>
        </div>
        <div className="*:not-first:mt-1">
          <Label htmlFor={`${id}-max`} className="text-xs">
            Importo massimo
          </Label>
          <div className="relative">
            <CurrencyInput
              id={`${id}-max`}
              value={inputValues[1]}
              onChange={(e) => handleInputChange(e, 1)}
              onBlur={() => validateAndUpdateValue(inputValues[1]!, 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndUpdateValue(inputValues[1]!, 1);
                }
              }}
            />

            <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center justify-center ps-3 text-sm text-muted-foreground peer-disabled:opacity-50">
              €
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <Button
        className="w-full"
        variant="outline"
        size="sm"
        onClick={() => {
          column.setFilterValue(
            inputValues
              ? [inputValues[0] ?? "", inputValues[1] ?? ""]
              : undefined,
          );
        }}
      >
        Mostra {countItemsInRange(sliderValue[0]!, sliderValue[1]!)} transazioni
      </Button>
    </div>
  );
}

export function NumberFilterFaceted<TData, TValue>({
  column,
}: {
  column: Column<TData, TValue>;
}) {
  const unknownValue = column?.getFilterValue();

  const selected = React.useMemo<NumberRange | undefined>(() => {
    function parseNumber(numberString?: string) {
      if (!numberString) return undefined;
      const parsedNumber = parseFloat(numberString);
      return Number.isNaN(parsedNumber) ? undefined : parsedNumber;
    }
    return Array.isArray(unknownValue)
      ? {
          min: parseNumber(unknownValue[0] as string),
          ...(!!unknownValue[1] && {
            max: parseNumber(unknownValue[1] as string),
          }),
        }
      : undefined;
  }, [unknownValue]);

  if (!selected?.min) return;

  return (
    <Badge
      variant="secondary"
      className="group rounded-sm p-1.5 px-2 font-normal"
      onClick={() => column?.setFilterValue(undefined)}
    >
      {selected.max ? (
        <span>{numberFormat.formatRange(selected.min, selected.max)}</span>
      ) : (
        <span>{numberFormat.format(selected.min)}</span>
      )}

      <XIcon className="" />
    </Badge>
  );
}
