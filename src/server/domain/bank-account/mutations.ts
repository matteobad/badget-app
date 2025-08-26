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
  orgId: string;
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
      externalId: payload.accountId,
      connectionId: payload.connectionId,
      institutionId: payload.institutionId,
      organizationId: payload.orgId,
      name: payload.name,
      currency: payload.currency,
      manual: payload.manual ?? true,
      enabled: payload.enabled,
      type: payload.type ?? "checking",
      logoUrl: payload.logoUrl,
      balance: payload.balance,
      accountReference: payload.accountReference,
    })
    .onConflictDoUpdate({
      target: [account_table.externalId, account_table.organizationId],
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
  orgId: string;
};

export async function deleteBankAccountMutation(
  db: DBClient,
  params: DeleteBankAccountParams,
) {
  const { id, orgId } = params;

  const [result] = await db
    .delete(account_table)
    .where(
      and(eq(account_table.id, id), eq(account_table.organizationId, orgId)),
    )
    .returning();

  return result;
}

export type UpdateBankAccountParams = {
  id: string;
  orgId: string;
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
  const { id, orgId, ...data } = params;

  const [result] = await db
    .update(account_table)
    .set(data)
    .where(
      and(eq(account_table.id, id), eq(account_table.organizationId, orgId)),
    )
    .returning();

  return result;
}
