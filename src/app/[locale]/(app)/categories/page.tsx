import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { BudgetPeriodFilter } from "~/components/budget/budget-period-filter";
import { CategoryActions } from "~/components/category/category-actions";
import { CategorySearchFilter } from "~/components/category/category-search-filter";
import { CategoryTree } from "~/components/category/category-tree";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { getI18n } from "~/shared/locales/server";
import { budgetFilterParamsSchema } from "~/shared/validators/budget.schema";
import { categoryFilterParamsSchema } from "~/shared/validators/category.schema";
import { createLoader } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

type CategoriesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CategoriesPage(props: CategoriesPageProps) {
  const t = await getI18n();
  // Load search parameters
  const searchParams = await props.searchParams;
  const loadCategoryFilterParams = createLoader(categoryFilterParamsSchema);
  const loadBudgetFilterParams = createLoader(budgetFilterParamsSchema);
  const categoryFilters = loadCategoryFilterParams(searchParams);
  const budgetFilters = loadBudgetFilterParams(searchParams);

  // Prepare query client form tRPC calls
  const queryClient = getQueryClient();
  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  // prefetch(trpc.todo.getAll.queryOptions());
  await queryClient.fetchQuery(
    trpc.category.getWithBudgets.queryOptions({
      ...categoryFilters,
      ...budgetFilters,
    }),
  );

  return (
    <HydrateClient>
      <div className="flex items-center justify-end gap-4 p-4">
        <CategorySearchFilter />
        <span className="flex-1"></span>
        <CategoryActions />
        <BudgetPeriodFilter />
        <span className="w-40 text-right text-sm text-muted-foreground">
          {t("category.budget")}
        </span>
      </div>

      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <CategoryTree />
        </Suspense>
      </ErrorBoundary>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </HydrateClient>
  );
}
