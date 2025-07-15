"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import BudgetInput from "./budget-input";

type Budget =
  RouterOutput["category"]["getWithBudgets"][number]["budgetInstances"][number];

export function UpdateCategoryBudget({ budget }: { budget: Budget }) {
  const [amount, setAmount] = useState<number>(budget.amount);

  const { filter } = useBudgetFilterParams();

  const trpc = useTRPC();

  const updateBudgetMutation = useMutation(
    trpc.budget.update.mutationOptions({
      onSuccess: () => {
        toast.success("Budget updated!");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const handleOverride = (value: number) => {
    updateBudgetMutation.mutate({
      id: budget.originalBudgetId,
      amount: value,
      categoryId: budget.categoryId,
      recurrence: budget.recurrence, // TODO: recurrence of filter period
      recurrenceEnd: filter.to,
      from: filter.from,
      to: filter.to,
    });
  };

  const handlePermanentChange = (value: number) => {
    updateBudgetMutation.mutate({
      id: budget.originalBudgetId,
      amount: value,
      categoryId: budget.categoryId,
      recurrence: budget.recurrence, // TODO: recurrence of filter period
      from: filter.from,
      to: filter.to,
    });
  };

  return (
    <div className="group relative flex w-[240px] shrink-0 items-center justify-start gap-2 font-mono text-muted-foreground">
      <BudgetInput
        value={amount}
        recurrence={budget.recurrence}
        isRecurring={budget.recurrence !== null}
        defaultAction="once"
        onValueChange={(value) => setAmount(value)}
        onOverride={handleOverride}
        onPermanentChange={handlePermanentChange}
        className="w-full"
      />
    </div>
  );
}
