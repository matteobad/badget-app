import type { DBClient } from "~/server/db";
import type { AccountType } from "~/shared/constants/enum";
import { account_table } from "~/server/db/schema/accounts";
import { and, eq } from "drizzle-orm";

export type CreateBankAccountPayload = {
  name: string;
  accountId?: string;
  institutionId?: string;
  connectionId?: string;
  balance: number;
  currency: string;
  userId: string;
  manual?: boolean;
  enabled?: boolean;
  type?: AccountType;
  logoUrl?: string;
  accountReference?: string;
};

export const createBankAccountMutation = async (
  db: DBClient,
  payload: CreateBankAccountPayload,
) => {
  const [result] = await db
    .insert(account_table)
    .values({
      rawId: payload.accountId,
      connectionId: payload.connectionId,
      institutionId: payload.institutionId,
      userId: payload.userId,
      name: payload.name,
      currency: payload.currency,
      manual: payload.manual,
      enabled: payload.enabled,
      type: payload.type ?? "checking",
      logoUrl: payload.logoUrl,
      balance: payload.balance,
      accountReference: payload.accountReference,
    })
    .onConflictDoUpdate({
      target: [account_table.rawId, account_table.userId],
      set: {
        connectionId: payload.connectionId,
        name: payload.name,
        currency: payload.currency,
        enabled: payload.enabled,
        balance: payload.balance,
        logoUrl: payload.logoUrl,
        //lastAccessed: new Date().toISOString(),
      },
    })
    .returning();

  return result;
};

type DeleteBankAccountParams = {
  id: string;
  userId: string;
};

export async function deleteBankAccountMutation(
  db: DBClient,
  params: DeleteBankAccountParams,
) {
  const { id, userId } = params;

  const [result] = await db
    .delete(account_table)
    .where(and(eq(account_table.id, id), eq(account_table.userId, userId)))
    .returning();

  return result;
}

export type UpdateBankAccountParams = {
  id: string;
  userId: string;
  name?: string;
  description?: string;
  type?: AccountType;
  balance?: number;
  enabled?: boolean;
  currency?: string;
};

export async function updateBankAccountMutation(
  db: DBClient,
  params: UpdateBankAccountParams,
) {
  const { id, userId, ...data } = params;

  const [result] = await db
    .update(account_table)
    .set(data)
    .where(and(eq(account_table.id, id), eq(account_table.userId, userId)))
    .returning();

  return result;
}
