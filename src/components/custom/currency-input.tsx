import type { NumericFormatProps } from "react-number-format";
import { NumericFormat } from "react-number-format";

import { Input } from "../ui/input";

export function CurrencyInput({
  thousandSeparator = true,
  ...props
}: NumericFormatProps) {
  return (
    <NumericFormat
      className="bg-background"
      thousandSeparator={thousandSeparator}
      customInput={Input}
      {...props}
    />
  );
}
