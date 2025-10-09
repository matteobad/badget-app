import { useCallback, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";

import { AnimatedNumber } from "../animated-number";
import { FormatAmount } from "../format-amount";
import type { SplitFormValues } from "./form-context";

export function Summary() {
  const { control, setValue } = useFormContext<SplitFormValues>();

  const { data: user } = useUserQuery();

  const currency = useWatch({
    control,
    name: "transaction.currency",
  });

  const amount = useWatch({
    control,
    name: "transaction.amount",
  });

  const remaining = useWatch({
    control,
    name: "remaining",
  });

  const lineItems = useWatch({
    control,
    name: "splits",
  });

  const subTotal =
    lineItems?.reduce((tot, value) => tot + value.amount, 0) ?? 0;

  const updateFormValues = useCallback(() => {
    setValue("subtotal", subTotal, { shouldValidate: true });
    setValue("remaining", Number((amount - subTotal).toFixed(2)), {
      shouldValidate: true,
    });
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
        <span className="text-right font-mono text-[11px] text-muted-foreground">
          <FormatAmount
            amount={subTotal}
            currency={currency}
            locale={user?.locale ?? undefined}
          />
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border py-4">
        <span className="min-w-6 flex-shrink-0 font-mono text-xs text-muted-foreground">
          Restanti
        </span>
        <span
          className={cn(
            "text-right font-mono text-xl font-medium",
            remaining === 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          <AnimatedNumber value={remaining} currency={currency} />
        </span>
      </div>
    </div>
  );
}
