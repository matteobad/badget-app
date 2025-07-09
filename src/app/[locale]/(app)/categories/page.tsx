import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryTree } from "~/components/category/category-tree";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { budgetFilterParamsSchema } from "~/shared/validators/budget.schema";
import { categoryFilterParamsSchema } from "~/shared/validators/category.schema";
import { createLoader } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

type CategoriesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CategoriesPage(props: CategoriesPageProps) {
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
    trpc.category.getFlatTree.queryOptions({
      categoryFilters,
      budgetFilters,
    }),
  );

  // prefetch warnings
  await queryClient.fetchQuery(
    trpc.budget.getBudgetWarnings.queryOptions({
      categoryFilters: {},
      budgetFilters,
    }),
  );

  return (
    <HydrateClient>
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
