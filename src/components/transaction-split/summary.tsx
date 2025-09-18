import { useCallback, useEffect } from "react";
import { useUserQuery } from "~/hooks/use-user";
import { useFormContext, useWatch } from "react-hook-form";

import { AnimatedNumber } from "../animated-number";
import { FormatAmount } from "../format-amount";
import { type SplitFormValues } from "./form-context";

export function Summary() {
  const { control, setValue } = useFormContext<SplitFormValues>();

  const { data: user } = useUserQuery();

  const currency = useWatch({
    control,
    name: "transaction.currency",
  });

  const total = useWatch({
    control,
    name: "transaction.amount",
  });

  const lineItems = useWatch({
    control,
    name: "splits",
  });

  const subTotal =
    lineItems?.reduce((tot, value) => (tot += value.amount), 0) ?? 0;

  const updateFormValues = useCallback(() => {
    setValue("subtotal", subTotal, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subTotal]);

  useEffect(() => {
    updateFormValues();
  }, [updateFormValues]);

  return (
    <div className="flex w-2/3 flex-col">
      <div className="flex items-center justify-between py-1">
        <span className="min-w-6 flex-shrink-0 font-mono text-xs text-muted-foreground">
          Subtotal
        </span>
        <span className="text-right font-mono text-[11px] text-[#878787]">
          <FormatAmount
            amount={subTotal}
            currency={currency}
            locale={user?.locale ?? undefined}
          />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border py-4">
        <span className="min-w-6 flex-shrink-0 font-mono text-xs text-muted-foreground">
          Total
        </span>
        <span className="text-right font-mono text-[21px] font-medium">
          <AnimatedNumber value={total} currency={currency} />
        </span>
      </div>
    </div>
  );
}
