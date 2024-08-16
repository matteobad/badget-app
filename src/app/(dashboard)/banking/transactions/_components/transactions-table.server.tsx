"use server";

import { getUserTransactions } from "~/server/db/queries/cached-queries";
import { TransactionsTable } from "./transactions-table";

export async function TransactionsTableServer() {
  // NOTE: When we have a filter we want to show all results so users can select
  // And handle all in once (export etc)
  const userTransactions = await getUserTransactions({});

  return <TransactionsTable data={userTransactions} />;
}
