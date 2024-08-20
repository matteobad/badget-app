import { desc, eq, gte, lt } from "drizzle-orm";

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

  // NOTE: used only for institution logo. Remove in the future
  const bankConnections = await db
    .select()
    .from(schema.bankConnections)
    .where(eq(schema.bankConnections.userId, userId));

  const data = await db
    .select()
    .from(schema.bankTransactions)
    .where(eq(schema.bankTransactions.userId, userId))
    .leftJoin(
      schema.bankAccounts,
      eq(schema.bankTransactions.accountId, schema.bankAccounts.accountId),
    )
    .limit(10)
    .orderBy(desc(schema.bankTransactions.date));

  return data.map((item) => {
    const connection = bankConnections.find(
      (bc) => bc.id === item.bank_accounts?.bankConnectionId,
    );

    return {
      ...item.bank_transactions,
      bankAccount: {
        institution: connection?.name,
        logoUrl: connection?.logoUrl,
        name: item.bank_accounts?.name,
      },
    };
  });
}

export type GetCategoriesParams = {
  userId: string;
};

export async function getCategoriesQuery(params: GetCategoriesParams) {
  const { userId } = params;

  const data = await db.query.categories.findMany({
    with: {
      budgets: {
        columns: {
          budget: true,
          period: true,
          activeFrom: true,
          categoryId: true,
        },
        where: lt(schema.categoryBudgets.activeFrom, new Date()),
        orderBy: desc(schema.categoryBudgets.activeFrom),
        limit: 1,
      },
    },
    where: eq(schema.categories.userId, userId),
    orderBy: desc(schema.categories.manual),
  });

  return data;
}
