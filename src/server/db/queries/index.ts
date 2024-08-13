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

  const query = db
    .select()
    .from(schema.bankAccounts)
    .where(eq(schema.bankAccounts.userId, userId))
    .orderBy(asc(schema.bankAccounts.createdAt), desc(schema.bankAccounts.name))
    .leftJoin(
      schema.institutions,
      eq(schema.bankAccounts.institutionId, schema.institutions.id),
    );

  return query;
}
