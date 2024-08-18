import { desc, eq } from "drizzle-orm";

import { db, schema } from "..";

export type GetUserBankAccountsParams = {
  userId: string;
  enabled?: boolean;
};

export async function getUserBankAccountsQuery(
  params: GetUserBankAccountsParams,
) {
  const { userId } = params;

  const data = await db.query.bankConnections.findMany({
    where: eq(schema.bankConnections.userId, userId),
    with: {
      bankAccount: {
        orderBy: desc(schema.bankAccounts.balance),
      },
    },
  });

  return data;
}

export type GetTransactionsParams = {
  userId: string;
};

export async function getTransactionsQuery(params: GetTransactionsParams) {
  const { userId } = params;

  const date = await db
    .select()
    .from(schema.bankTransactions)
    .where(eq(schema.bankTransactions.userId, userId))
    .orderBy(desc(schema.bankTransactions.date));

  return date;
}

export type GetCategoriesParams = {
  userId: string;
};

export async function getCategoriesQuery(params: GetCategoriesParams) {
  const { userId } = params;

  const data = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.userId, userId))
    .orderBy(desc(schema.categories.manual));

  return data;
}
