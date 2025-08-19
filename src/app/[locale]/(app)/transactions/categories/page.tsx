import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { CategoryActions } from "~/components/category/category-actions";
import { CategorySearchFilter } from "~/components/category/category-search-filter";
import { DataList } from "~/components/category/data-list";
import { DataTableSkeleton } from "~/components/category/table/data-table-skeleton";
import { ErrorFallback } from "~/components/error-fallback";
import { HydrateClient, prefetch, trpc } from "~/shared/helpers/trpc/server";
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

  prefetch(trpc.category.get.queryOptions({ ...categoryFilters }));

  return (
    <div className="flex max-w-screen-lg flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="sr-only">Categories</h1>
        <CategorySearchFilter />
        <span className="flex-1"></span>
        <CategoryActions />
      </header>

      <HydrateClient>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<DataTableSkeleton />}>
            {/* <DataTable /> */}
            <DataList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>

      {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
    </div>
  );
}
