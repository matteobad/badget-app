"server-only";

import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { and, asc, desc, eq } from "drizzle-orm";

type GetBankAccountsQuery = {
  connectionId?: string;
  enabled?: boolean;
  manual?: boolean;
  userId?: string;
};

export async function getBankAccountsQuery(params: GetBankAccountsQuery) {
  const { userId, connectionId, enabled, manual } = params;

  const where = [];

  if (userId) {
    where.push(eq(account_table.userId, userId));
  }

  if (connectionId) {
    where.push(eq(account_table.connectionId, connectionId));
  }

  if (manual) {
    where.push(eq(account_table.manual, manual));
  }

  if (typeof enabled === "boolean") {
    where.push(eq(account_table.enabled, enabled));
  }

  const results = await db
    .select()
    .from(account_table)
    .where(and(...where))
    .orderBy(asc(account_table.createdAt), desc(account_table.name));

  return results;
}

type GetBankAccountByIdParams = {
  id: string;
  userId: string;
};

export async function getBankAccountByIdQuery(
  params: GetBankAccountByIdParams,
) {
  const { id, userId } = params;

  const [result] = await db
    .select()
    .from(account_table)
    .where(and(eq(account_table.id, id), eq(account_table.userId, userId)));

  return result;
}
