import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import { QUERIES } from "~/server/db/queries";
import { CACHED_QUERIES } from "~/server/db/queries/cached-queries";
import AddPanel from "./_components/add-panel";
import ConnectPanel from "./_components/connect-panel";
import EditTransactionDrawerDialog from "./_components/edit-drawer-dialog";
import ImportPanel from "./_components/import-panel";
import TransactionDataTable from "./_components/transaction-table";
import { TransactionsEmptyPlaceholder } from "./_components/transactions-empty-placeholder";
import { transactionsSearchParamsCache } from "./transaction-search-params";

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

      <AddPanel accounts={accountsData} categories={categoriesData} />
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
