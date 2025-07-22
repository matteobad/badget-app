import type { DBClient } from "~/server/db";
import type { AccountType } from "~/server/db/schema/enum";
import { account_table } from "~/server/db/schema/accounts";

export type CreateBankAccountPayload = {
  name: string;
  accountId: string;
  institutionId?: string;
  connectionId?: string;
  balance: number;
  currency: string;
  userId: string;
  manual?: boolean;
  enabled?: boolean;
  type?: AccountType;
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
      balance: payload.balance,
    })
    .onConflictDoUpdate({
      target: [account_table.rawId, account_table.userId],
      set: {
        connectionId: payload.connectionId,
        name: payload.name,
        currency: payload.currency,
        enabled: payload.enabled,
        balance: payload.balance,
        //lastAccessed: new Date().toISOString(),
      },
    })
    .returning();

  return result;
};
