import type { DBClient } from "~/server/db";
import type { AccountSubtype, AccountType } from "~/shared/constants/enum";
import { account_table } from "~/server/db/schema/accounts";
import { and, eq } from "drizzle-orm";

export type CreateBankAccountPayload = {
  name: string;
  balance: number;
  currency: string;
  externalId?: string;
  institutionId?: string;
  connectionId?: string;
  openingBalance?: number;
  manual?: boolean;
  enabled?: boolean;
  type?: AccountType;
  subtype?: AccountSubtype;
  logoUrl?: string;
  accountReference?: string;
  authoritativeFrom?: string;
  t0Datetime?: string;
  organizationId: string;
};

export const createBankAccountMutation = async (
  db: DBClient,
  payload: CreateBankAccountPayload,
) => {
  const [result] = await db
    .insert(account_table)
    .values(payload)
    .onConflictDoUpdate({
      target: [account_table.externalId, account_table.organizationId],
      set: {
        connectionId: payload.connectionId,
        name: payload.name,
        currency: payload.currency,
        enabled: payload.enabled,
        balance: payload.balance,
        logoUrl: payload.logoUrl,
        externalId: payload.externalId,
        authoritativeFrom: payload.authoritativeFrom,
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

export type UpsertBalanceOffsetParams = {
  id: string;
  balance: number;
  date: string;
  organizationId: string;
};
