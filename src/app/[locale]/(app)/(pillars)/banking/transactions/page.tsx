import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import { QUERIES } from "~/server/db/queries";
import AddPanel from "../add-panel";
import BackfillPanel from "../backfill-panel";
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
  const transactions = [];

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const [accountsData, categoriesData] = await Promise.all([
    QUERIES.getAccountsForUser(session.userId),
    QUERIES.getCategoriesForUser(session.userId),
  ]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {transactions.length === 0 ? (
          <TransactionsEmptyPlaceholder />
        ) : (
          <></>
          // transactions.map((transaction) => {
          //   return <span key={transaction.id}>{transaction.name}</span>;
          // })
        )}
      </div>

      <AddPanel accounts={accountsData} categories={categoriesData} />
      <BackfillPanel />
    </>
  );
}
