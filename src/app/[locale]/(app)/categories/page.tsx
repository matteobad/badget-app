import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryBudgets } from "~/components/category/category-budgets";
import { CategoryFilters } from "~/components/category/category-filters";
import { CategoryTree } from "~/components/category/category-tree";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { BudgetFilterParamsSchema } from "~/shared/validators/budget.schema";
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
  const loadBudgetFilterParams = createLoader(BudgetFilterParamsSchema);
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
      categoryFilters,
      budgetFilters,
    }),
  );

  return (
    <HydrateClient>
      <div className="grid grid-cols-3 gap-4 p-4 pt-0">
        <Card className="col-span-2">
          <CardHeader className="sr-only flex-row items-center justify-between">
            <CardTitle>Categorie</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryTree />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
          {/* <CardFooter className="border-t pt-6">TODO</CardFooter> */}
        </Card>

        <Card className="col-span-1">
          <CardHeader className="sr-only flex-row items-center justify-between">
            <CardTitle>Category Budgets</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryBudgets />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
          <CardFooter className="border-t pt-6">TODO</CardFooter>
        </Card>

        {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
      </div>
    </HydrateClient>
  );
}
