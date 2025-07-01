import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryBudgets } from "~/components/category/category-budgets";
import { CategoryTree } from "~/components/category/category-tree";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
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
      categoryFilters: {},
      budgetFilters,
    }),
  );

  return (
    <HydrateClient>
      <ResizablePanelGroup direction="horizontal" className="md:min-w-[450px]">
        <ResizablePanel className="p-4" defaultSize={70} minSize={50}>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryTree />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={30}>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryBudgets />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </HydrateClient>
  );
}
