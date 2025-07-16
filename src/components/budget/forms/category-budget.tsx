"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { optimisticallyUpdateCategoryWithBudgets } from "~/server/domain/category/helpers";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import BudgetInput from "./budget-input";

export function CategoryBudget({ categoryId }: { categoryId: string }) {
  const { filter: budgetFilters } = useBudgetFilterParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.budget.get.queryOptions(
      {
        categoryId: categoryId,
        from: budgetFilters.from,
        to: budgetFilters.to,
      },
      {
        enabled: !!categoryId,
        staleTime: 0, // Always consider data stale so it always refetches
        // initialData: () => {
        //   const categories: CategoryWithAccrual[] = queryClient.getQueriesData({
        //     queryKey: trpc.category.getWithBudgets.queryKey({ ...budgetFilters }),
        //   });
        //   // @ts-expect-error investigate this
        //   const budgets = categories.find((c) => c.id === categoryId)?.budgetInstances.fi ?? [];

        // },
      },
    ),
  );

  const updateBudgetMutation = useMutation(
    trpc.budget.update.mutationOptions({
      onSuccess: (_data) => {
        toast.success("Budget updated");
        void queryClient.invalidateQueries({
          queryKey: trpc.budget.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getWithBudgets.queryKey(),
        });
      },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.budget.get.queryKey({
              categoryId,
              ...budgetFilters,
            }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.category.getWithBudgets.queryKey({
              ...budgetFilters,
            }),
          }),
        ]);

        // Snapshot the previous values
        const previousData = {
          budgetList: queryClient.getQueryData(
            trpc.budget.get.queryKey({ categoryId, ...budgetFilters }),
          ),
          categoryList: queryClient.getQueryData(
            trpc.category.getWithBudgets.queryKey({ ...budgetFilters }),
          ),
        };

        // Optimistically update category budget view
        queryClient.setQueryData(
          trpc.budget.get.queryKey({ categoryId, ...budgetFilters }),
          (old) => {
            if (!old) return old;

            return old.map((budgets) => {
              // TODO: optimistically update
              return budgets;
            });
          },
        );

        // Optimistically update list view
        queryClient.setQueryData(
          trpc.category.getWithBudgets.queryKey(),
          (old) => {
            if (!old) return old;
            return optimisticallyUpdateCategoryWithBudgets(
              old,
              {
                id: variables.id,
                amount: variables.amount,
                categoryId: variables.categoryId,
                recurrence: variables.recurrence,
                from: new Date(variables.from),
                to: new Date(variables.to),
              },
              {
                from: new Date(budgetFilters.from),
                to: new Date(budgetFilters.to),
              },
            );
          },
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Revert both caches on error
        queryClient.setQueryData(
          trpc.budget.get.queryKey(),
          context?.previousData.budgetList,
        );
        queryClient.setQueryData(
          trpc.category.getWithBudgets.queryKey(),
          context?.previousData.categoryList,
        );
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.budget.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getWithBudgets.queryKey(),
        });
      },
    }),
  );

  if (isLoading || !data?.[0]) {
    return null;
  }

  // Update category budget
  return (
    <div className="group relative flex w-[240px] shrink-0 items-center justify-start gap-2 font-mono text-muted-foreground">
      <BudgetInput
        value={data[0].amount}
        recurrence={data[0].recurrence}
        isRecurring={data[0].recurrence !== null}
        defaultAction="once"
        onOverride={(value) => {
          updateBudgetMutation.mutate({
            id: data[0]!.id,
            amount: value,
            categoryId: data[0]!.categoryId,
            recurrence: data[0]!.recurrence, // TODO: recurrence of filter period
            from: budgetFilters.from,
            to: budgetFilters.to,
          });
        }}
        onPermanentChange={(value) => {
          updateBudgetMutation.mutate({
            id: data[0]!.id,
            amount: value,
            categoryId: data[0]!.categoryId,
            recurrence: data[0]!.recurrence, // TODO: recurrence of filter period
            from: budgetFilters.from,
            to: budgetFilters.to,
          });
        }}
        className="w-full"
      />
    </div>
  );
}
