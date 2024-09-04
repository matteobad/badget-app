import {
  getFilteredAccounts,
  getFilteredTransactions,
  getUserCategories,
} from "~/server/db/queries/cached-queries";
import { TransactionToCategoryForm } from "./transaction-to-category-form";

export async function TransactionToCategoryServer({
  reference,
}: {
  reference: string;
}) {
  const categories = await getUserCategories({});
  const accounts = await getFilteredAccounts({ ref: reference });
  const transactions = await getFilteredTransactions({
    page: 1,
    per_page: 5,
    account: accounts.map((a) => a?.id).join("."),
  });

  return (
    <TransactionToCategoryForm
      categories={categories}
      transactions={transactions.data}
    />
  );
}
