import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import AddTransactionDrawerDialog from "~/features/transaction/components/add-transaction-drawer-dialog";
import ConnectPanel from "~/features/transaction/components/connect-panel";
import EditTransactionDrawerDialog from "~/features/transaction/components/edit-drawer-dialog";
import ImportPanel from "~/features/transaction/components/import-panel";
import TransactionDataTable from "~/features/transaction/components/transaction-table";
import { TransactionsEmptyPlaceholder } from "~/features/transaction/components/transactions-empty-placeholder";
import { CACHED_QUERIES } from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import { QUERIES } from "~/server/db/queries";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function BankingTransactionsPage({
  searchParams,
}: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  // TODO: improve performance with Suspence bounderies
  const [institutionsData, accountsData, categoriesData, transactionsData] =
    await Promise.all([
      QUERIES.getInstitutionsForCountry("IT"),
      QUERIES.getAccountsForUser(session.userId),
      QUERIES.getCategoriesForUser(session.userId),
      CACHED_QUERIES.getTransactionForUser(session.userId),
    ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {transactionsData.length === 0 ? (
          <TransactionsEmptyPlaceholder />
        ) : (
          <TransactionDataTable data={transactionsData} />
        )}
      </div>

      <AddTransactionDrawerDialog
        accounts={accountsData}
        categories={categoriesData}
      />
      <ImportPanel accounts={accountsData} categories={categoriesData} />
      <ConnectPanel institutions={institutionsData} />

      <EditTransactionDrawerDialog
        accounts={accountsData}
        categories={categoriesData}
        transactions={transactionsData}
      />
    </>
  );
}
