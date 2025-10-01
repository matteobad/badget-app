import type { Metadata } from "next";
import { Suspense } from "react";
import { ErrorFallback } from "~/components/error-fallback";
import { CategoriesDataTable } from "~/components/transaction-category/table/data-table";
import { CategoriesSkeleton } from "~/components/transaction-category/table/data-table.skeleton";
import { HydrateClient, prefetch, trpc } from "~/shared/helpers/trpc/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Categories | Badget.",
};

export default async function CategoriesPage() {
  prefetch(trpc.transactionCategory.get.queryOptions());

  return (
    <div className="max-w-screen-lg py-6">
      <HydrateClient>
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<CategoriesSkeleton />}>
            <CategoriesDataTable />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </div>
  );
}
