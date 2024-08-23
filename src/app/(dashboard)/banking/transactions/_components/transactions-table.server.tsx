"use server";

import { type z } from "zod";

import { type transactionsSearchParamsSchema } from "~/lib/validators";
import {
  getFilteredTransactions,
  getUserBankAccounts,
  getUserCategories,
} from "~/server/db/queries/cached-queries";
import { TransactionsTable } from "./transactions-table";

export async function TransactionsTableServer(
  params: z.infer<typeof transactionsSearchParamsSchema>,
) {
  // NOTE: When we have a filter we want to show all results so users can select
  // And handle all in once (export etc)
  const { data, pageCount } = await getFilteredTransactions(params);
  const userCategories = await getUserCategories({});
  const userAccounts = await getUserBankAccounts({});

  return (
    <TransactionsTable
      data={data}
      pageCount={pageCount}
      categories={userCategories}
      accounts={userAccounts}
    />
  );
}
