"use client";

import { useBudgetFilterParams } from "~/hooks/use-budget-filter-params";
import { useCategoryFilterParams } from "~/hooks/use-category-filter-params";
import { useI18n, useScopedI18n } from "~/shared/locales/client";

export function CategoryBudgets() {
  const tScoped = useScopedI18n("categories.budget");

  const { filter: categoryFilters } = useCategoryFilterParams();
  const { filter: budgetFilters } = useBudgetFilterParams();

  // const trpc = useTRPC();

  // const { data: items } = useSuspenseQuery(
  //   trpc.category.getFlatTree.queryOptions({
  //     categoryFilters,
  //     budgetFilters,
  //   }),
  // );

  return <div className="flex flex-col gap-2">category budgets</div>;
}
