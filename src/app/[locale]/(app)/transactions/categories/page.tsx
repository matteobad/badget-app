import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryActions } from "~/components/category/category-actions";
import { CategorySearchFilter } from "~/components/category/category-search-filter";
import { DataList } from "~/components/category/data-list";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { categoryFilterParamsSchema } from "~/shared/validators/category.schema";
import { createLoader } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Categories | Badget.",
};

type CategoriesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function CategoriesPage(props: CategoriesPageProps) {
  // Load search parameters
  const searchParams = await props.searchParams;
  const loadCategoryFilterParams = createLoader(categoryFilterParamsSchema);
  const categoryFilters = loadCategoryFilterParams(searchParams);

  // Prepare query client form tRPC calls
  const queryClient = getQueryClient();
  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  // prefetch(trpc.todo.getAll.queryOptions());
  await queryClient.fetchQuery(
    trpc.category.get.queryOptions({ ...categoryFilters }),
  );

  return (
    <HydrateClient>
      <header className="flex flex-row p-6">
        <h1 className="sr-only">Categories</h1>
        <CategorySearchFilter />
        <span className="flex-1"></span>
        <CategoryActions />
      </header>

      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>
          <DataList />
        </Suspense>
      </ErrorBoundary>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </HydrateClient>
  );
}
