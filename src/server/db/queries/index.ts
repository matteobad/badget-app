import { asc, desc, eq } from "drizzle-orm";

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
        orderBy: desc(schema.bankAccounts.amount),
      },
    },
  });

  return data;
}
