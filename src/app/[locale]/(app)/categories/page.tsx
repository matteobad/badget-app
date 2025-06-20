import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CategoryFilters } from "~/features/category/components/category-filters";
import { CategoryTree } from "~/features/category/components/category-tree";
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
    trpc.category.getCategoryTree.queryOptions({
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
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Categorie</CardTitle>
            <CategoryFilters />
          </CardHeader>
          <CardContent>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryTree />
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
