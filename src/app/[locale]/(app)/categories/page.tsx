import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { CategoryTreeview } from "~/features/category/components/category-treeview";
import { api, HydrateClient } from "~/lib/trpc/server";
import { categoriesSearchParamsCache } from "../../../../features/category/utils/search-params";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const params = await categoriesSearchParamsCache.parse(searchParams);

  void api.category.getCategoriesWithBudgets.prefetch(params);
  // const { userId } = await auth();
  // if (!userId) unauthorized();

  // const promise = getCategoriesWithBudgets_CACHED(userId, { from, to, period });

  return (
    <HydrateClient>
      <div className="flex flex-1 flex-col gap-2 p-4 pt-0">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <CategoryTreeview />
          </Suspense>
        </ErrorBoundary>

        {/* <CreateCategoryDrawerSheet categories={categories} />
      <UpdateCategoryDrawerSheet categories={categories} /> */}
      </div>
    </HydrateClient>
  );
}
