import { getTransactions } from "~/server/actions/institutions/get-transactions";
import { getUserCategories } from "~/server/db/queries/cached-queries";
import { type Provider } from "~/server/db/schema/enum";

export async function TransactionToCategoryServer({
  accounts,
}: {
  reference: string;
  provider: Provider;
  accounts: string[];
}) {
  const categories = await getUserCategories({});
  let transactions: Awaited<ReturnType<typeof getTransactions>> = [];

  for (const accountId of accounts) {
    const data = await getTransactions({
      bankAccountId: accountId,
      latest: false,
    });

    transactions = [...transactions, ...data];
  }

  return (
    <TransactionToCategoryForm
      categories={categories}
      transactions={transactions}
    />
  );
}
