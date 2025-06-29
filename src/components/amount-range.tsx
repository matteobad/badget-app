"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSliderWithInput } from "~/hooks/use-slider-with-input";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";

import { CurrencyInput } from "./custom/currency-input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

export function AmountRange() {
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  const trpc = useTRPC();

  const { data: items, isLoading } = useQuery(
    trpc.transaction.getAmountRange.queryOptions(),
  );

  console.log(items);

  const [amountRange, setAmountRange] = useQueryState(
    "amount_range",
    parseAsArrayOf(parseAsInteger),
  );

  const minValue = items?.length
    ? Math.min(...items.map((item) => Number(item.amount) || 0))
    : 0;
  const maxValue = items?.length
    ? Math.max(...items.map((item) => Number(item.amount) || 0))
    : 0;

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
    setValues,
  } = useSliderWithInput({
    minValue,
    maxValue,
    initialValue: amountRange ?? [minValue, maxValue],
  });

  useEffect(() => {
    if (minValue !== undefined && maxValue !== undefined) {
      setValues([minValue, maxValue]);
    }
  }, [minValue, maxValue, setValues]);

  if (isLoading) return null;

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values);
  };

  const countItemsInRange = (min: number, max: number) => {
    if (!items) return 0;
    return items.filter((item) => {
      const amount =
        typeof item.amount === "number" ? item.amount : Number(item.amount);
      return !Number.isNaN(amount) && amount >= min && amount <= max;
    }).length;
  };

  const totalCount = countItemsInRange(
    sliderValue[0] ?? minValue,
    sliderValue[1] ?? maxValue,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <form
          className="flex w-full items-center justify-between gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (sliderValue[0] !== undefined && sliderValue[1] !== undefined) {
              void setAmountRange([sliderValue[0], sliderValue[1]]);
            }
          }}
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="min-amount" className="text-xs">
              Min amount
            </Label>

            <CurrencyInput
              className="w-full font-mono text-xs"
              type="text"
              inputMode="decimal"
              value={inputValues[0] ?? ""}
              onChange={(e) => handleInputChange(e, 0)}
              onFocus={(e) => e.target.select()}
              onBlur={() => validateAndUpdateValue(inputValues[0] ?? "", 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  validateAndUpdateValue(inputValues[0] ?? "", 0);
                  maxInputRef.current?.focus();
                }
              }}
              aria-label="Enter minimum amount"
              getInputRef={minInputRef}
            />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="max-amount" className="text-xs">
              Max amount
            </Label>

            <CurrencyInput
              className="w-full font-mono text-xs"
              type="text"
              inputMode="decimal"
              value={inputValues[1] ?? ""}
              onChange={(e) => handleInputChange(e, 1)}
              onFocus={(e) => e.target.select()}
              onBlur={() => validateAndUpdateValue(inputValues[1] ?? "", 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  validateAndUpdateValue(inputValues[1] ?? "", 1);
                }
              }}
              aria-label="Enter maximum amount"
              getInputRef={maxInputRef}
            />
          </div>
        </form>
      </div>

      <Slider
        value={sliderValue}
        onValueChange={handleSliderValueChange}
        min={minValue}
        max={maxValue}
        aria-label="Amount range"
      />

      <Button
        className="w-full text-xs"
        variant="outline"
        disabled={totalCount === 0}
        onClick={() => {
          if (sliderValue[0] !== undefined && sliderValue[1] !== undefined) {
            void setAmountRange([sliderValue[0], sliderValue[1]]);
          }
        }}
      >
        {totalCount === 0
          ? "No transactions"
          : `Show ${totalCount} transactions`}
      </Button>
    </div>
  );
}
