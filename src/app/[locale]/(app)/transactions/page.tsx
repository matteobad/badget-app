import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import LinkInstitutionDrawerDialog from "~/features/account/components/link-institution-drawer-dialog";
import { getCategoriesForUser_QUERY } from "~/features/category/server/queries";
import ImportTransactionDrawerDialog from "~/features/import-csv/components/import-transaction-drawer-dialog";
import { getInstitutionsForCountry } from "~/features/open-banking/server/queries";
import CreateTransactionDrawerSheet from "~/features/transaction/components/create-transaction-drawer-sheet";
import TransactionDataTable from "~/features/transaction/components/transaction-table";
import { TransactionsEmptyPlaceholder } from "~/features/transaction/components/transactions-empty-placeholder";
import UpdateTransactionDrawerSheet from "~/features/transaction/components/update-transaction-drawer-sheet";
import { getTransactionForUser_CACHED } from "~/features/transaction/server/cached-queries";
import { transactionsSearchParamsCache } from "~/features/transaction/utils/search-params";
import { QUERIES } from "~/server/db/queries";
import { actionsSearchParamsCache } from "~/utils/search-params";

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function BankingTransactionsPage({
  searchParams,
}: PageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await actionsSearchParamsCache.parse(searchParams);
  const {} = await transactionsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  // TODO: improve performance with Suspence bounderies
  const [institutionsData, accountsData, categoriesData, transactionsData] =
    await Promise.all([
      getInstitutionsForCountry("IT"),
      QUERIES.getAccountsForUser(session.userId),
      getCategoriesForUser_QUERY(session.userId),
      getTransactionForUser_CACHED(session.userId),
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

      <CreateTransactionDrawerSheet
        accounts={accountsData}
        categories={categoriesData}
      />
      <ImportTransactionDrawerDialog
        accounts={accountsData}
        categories={categoriesData}
      />
      <LinkInstitutionDrawerDialog institutions={institutionsData} />

      <UpdateTransactionDrawerSheet
        accounts={accountsData}
        categories={categoriesData}
        transactions={transactionsData}
      />
    </>
  );
}
