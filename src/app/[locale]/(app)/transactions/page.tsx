import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { TransactionSplitDialog } from "~/components/transaction-split/transaction-split-dialog";
import { TransactionsSearchFilter } from "~/components/transaction/filters/transactions-search-filter";
import { DataTable } from "~/components/transaction/table/data-table";
import { Loading } from "~/components/transaction/table/loading";
import { TransactionsActions } from "~/components/transaction/transactions-actions";
import { loadSortParams } from "~/hooks/use-sort-params";
import { getInitialTransactionsColumnVisibility } from "~/server/domain/transaction/helpers";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { transactionFilterParamsSchema } from "~/shared/validators/transaction.schema";
import { createLoader } from "nuqs/server";
import { ErrorBoundary } from "react-error-boundary";

export const metadata: Metadata = {
  title: "Transactions | Badget.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function TransactionsPage(props: PageProps) {
  const queryClient = getQueryClient();
  const searchParams = await props.searchParams;

  const loadFilterParams = createLoader(transactionFilterParamsSchema);
  const filter = loadFilterParams(searchParams);
  const { sort } = loadSortParams(searchParams);

  const columnVisibility = getInitialTransactionsColumnVisibility();

  // Change this to prefetch once this is fixed: https://github.com/trpc/trpc/issues/6632
  await queryClient.fetchInfiniteQuery(
    trpc.transaction.get.infiniteQueryOptions({
      ...filter,
      sort,
    }),
  );

  return (
    <HydrateClient>
      <div className="flex justify-between py-6">
        <TransactionsSearchFilter />
        <TransactionsActions />
      </div>

      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<Loading />}>
          <DataTable columnVisibility={columnVisibility} />
        </Suspense>
      </ErrorBoundary>

      {/* Local sheets */}
      <TransactionSplitDialog />
    </HydrateClient>
  );
}
