import { getUserTransactions } from "~/server/db/queries/cached-queries";
import { columns } from "./transactions-columns";
import { TransactionsDataTable } from "./transactions-data-table";

export async function TransactionsTableServer() {
  // NOTE: When we have a filter we want to show all results so users can select
  // And handle all in once (export etc)
  const data = await getUserTransactions({});

  return <TransactionsDataTable columns={columns} data={data} />;
}
