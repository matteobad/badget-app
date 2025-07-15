"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { BUDGET_RECURRENCE } from "~/server/db/schema/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import BudgetInput from "./budget-input";

export function CreateCategoryBudget({ categoryId }: { categoryId: string }) {
  const [amount, setAmount] = useState<number>(0);

  const { filter } = useBudgetFilterParams();

  const trpc = useTRPC();

  const createBudgetMutation = useMutation(
    trpc.budget.create.mutationOptions({
      onSuccess: () => {
        toast.success("Budget created!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleOverride = (value: number) => {
    createBudgetMutation.mutate({
      amount: value,
      categoryId: categoryId,
      recurrence: BUDGET_RECURRENCE.MONTHLY, // TODO: recurrence of filter period
      recurrenceEnd: filter.to,
      from: filter.from,
      to: filter.to,
    });
  };

  const handlePermanentChange = (value: number) => {
    createBudgetMutation.mutate({
      amount: value,
      categoryId: categoryId,
      recurrence: BUDGET_RECURRENCE.MONTHLY, // TODO: recurrence of filter period
      from: filter.from,
      to: filter.to,
    });
  };

  return (
    <div className="group relative flex w-[240px] shrink-0 items-center justify-start gap-2 font-mono text-muted-foreground">
      <BudgetInput
        value={amount}
        recurrence={BUDGET_RECURRENCE.MONTHLY}
        isRecurring={true}
        defaultAction="always"
        onValueChange={(value) => setAmount(value)}
        onOverride={handleOverride}
        onPermanentChange={handlePermanentChange}
        className="w-full"
      />
    </div>
  );
}
