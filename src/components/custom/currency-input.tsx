import type { NumericFormatProps } from "react-number-format";
import { Input } from "~/components/ui/input";
import { NumericFormat } from "react-number-format";

export function CurrencyInput({
  thousandSeparator = true,
  ...props
}: NumericFormatProps) {
  return (
    <NumericFormat
      thousandSeparator={thousandSeparator}
      customInput={Input}
      {...props}
    />
  );
}
