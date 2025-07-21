import type { DBClient } from "~/server/db";
import type { AccountType } from "~/server/db/schema/enum";
import { account_table } from "~/server/db/schema/accounts";

export type CreateBankAccountPayload = {
  name: string;
  accountId: string;
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
      userId: payload.userId,
      name: payload.name,
      currency: payload.currency,
      manual: payload.manual,
      enabled: payload.enabled,
      type: "checking",
      balance: payload.balance,
    })
    .returning();

  return result;
};
