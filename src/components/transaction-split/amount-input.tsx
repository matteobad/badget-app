import type { Path } from "react-hook-form";
import type { NumericFormatProps } from "react-number-format";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useController, useFormContext } from "react-hook-form";

import type { SplitFormValues } from "./form-context";
import { CurrencyInput } from "../custom/currency-input";

type AmountInputProps<P extends Path<SplitFormValues>> = Omit<
  NumericFormatProps,
  "value" | "onChange"
> & {
  name: P;
  handleBlur: () => void;
  className?: string;
};

export function AmountInput<P extends Path<SplitFormValues>>({
  className,
  name,
  ...props
}: AmountInputProps<P>) {
  const [isFocused, setIsFocused] = useState(false);
  const { control } = useFormContext<SplitFormValues>();
  const {
    field: { value, onChange, onBlur },
  } = useController({
    name,
    control,
  });

  const isPlaceholder = !value && !isFocused;

  return (
    <div className="relative font-mono">
      <CurrencyInput
        autoComplete="off"
        value={value as number}
        onValueChange={(values) => {
          onChange(values.floatValue, {
            shouldValidate: true,
          });
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
          props.handleBlur();
        }}
        {...props}
        className={cn(
          className,
          isPlaceholder && "opacity-0",
          "h-6 border-0 border-b border-transparent !bg-transparent p-0 text-xs shadow-none focus:border-border",
        )}
        thousandSeparator={true}
        allowLeadingZeros={false}
        fixedDecimalScale={true}
        decimalScale={2}
        allowNegative={true}
      />

      {isPlaceholder && (
        <div className="pointer-events-none absolute inset-0">
          <div className="h-full w-full bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)]" />
        </div>
      )}
    </div>
  );
}
