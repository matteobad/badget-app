import { type SearchParams } from "nuqs/server";

import { getAccountsForActiveWorkspace } from "~/server/db/queries/accounts-queries-cached";
import { CreateTransactionSheet } from "./_components/create-transaction-sheet";
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
  const transactions = await getAccountsForActiveWorkspace();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {transactions.length === 0 ? (
          <TransactionsEmptyPlaceholder />
        ) : (
          transactions.map((transaction) => {
            return <span key={transaction.id}>{transaction.name}</span>;
          })
        )}
      </div>

      <CreateTransactionSheet />
    </>
  );
}
