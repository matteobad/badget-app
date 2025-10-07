"use client";

import NumberFlow from "@number-flow/react";

type Props = {
  value: number;
  currency: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
  animated?: boolean;
};

export function AnimatedNumber({
  value,
  currency,
  minimumFractionDigits,
  maximumFractionDigits,
  locale,
  animated = true,
}: Props) {
  return (
    <NumberFlow
      animated={animated}
      value={value}
      format={{
        style: "currency",
        currency: currency ?? "EUR",
        minimumFractionDigits,
        maximumFractionDigits,
      }}
      willChange
      locales={locale ?? "it"}
    />
  );
}
