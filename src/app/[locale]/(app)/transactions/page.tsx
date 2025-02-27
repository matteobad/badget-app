import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton";
import LinkInstitutionDrawerDialog from "~/features/account/components/link-institution-drawer-dialog";
import { getAccounts_CACHED } from "~/features/account/server/cached-queries";
import { getCategories_CACHED } from "~/features/category/server/cached-queries";
import ImportTransactionDrawerDialog from "~/features/import-csv/components/import-transaction-drawer-dialog";
import { getInstitutionsForCountry } from "~/features/open-banking/server/queries";
import CreateTransactionDrawerSheet from "~/features/transaction/components/create-transaction-drawer-sheet";
import { TransactionsTable } from "~/features/transaction/components/tables/transactions-table";
import {
  getTransactionAccountCounts_CACHED,
  getTransactionCategoryCounts_CACHED,
  getTransactions_CACHED,
} from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import { actionsSearchParamsCache } from "~/utils/search-params";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await actionsSearchParamsCache.parse(searchParams);
  const search = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const [institutions, categories, accounts] = await Promise.all([
    getInstitutionsForCountry("IT"),
    getCategories_CACHED(session.userId),
    getAccounts_CACHED(session.userId),
  ]);

  const promises = Promise.all([
    getTransactions_CACHED({ ...search }, session.userId),
    getTransactionCategoryCounts_CACHED(session.userId),
    getTransactionAccountCounts_CACHED(session.userId),
    getCategories_CACHED(session.userId),
    getAccounts_CACHED(session.userId),
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Suspense
          fallback={
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <TransactionsTable promises={promises} />
        </Suspense>
      </div>

      <CreateTransactionDrawerSheet
        accounts={accounts}
        categories={categories}
      />
      <ImportTransactionDrawerDialog
        accounts={accounts}
        categories={categories}
      />
      <LinkInstitutionDrawerDialog institutions={institutions} />
    </>
  );
}
