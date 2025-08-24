import type { DBClient } from "~/server/db";
import { account_balance_table } from "~/server/db/schema/accounts";

export type CreateBankAccountBalancePayload = {
  accountId: string;
  date: string;
  balance: number;
  currency: string;
  organizationId: string;
};

export const createBankAccountBalanceMutation = async (
  db: DBClient,
  payload: CreateBankAccountBalancePayload,
) => {
  const [result] = await db
    .insert(account_balance_table)
    .values(payload)
    .onConflictDoUpdate({
      target: [account_balance_table.accountId, account_balance_table.date],
      set: {
        balance: payload.balance,
        currency: payload.currency,
      },
    })
    .returning();

  return result;
};
