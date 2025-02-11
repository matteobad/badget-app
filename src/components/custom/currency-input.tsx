import type { NumericFormatProps } from "react-number-format";
import { NumericFormat } from "react-number-format";

import { Input } from "~/components/ui/input";

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
