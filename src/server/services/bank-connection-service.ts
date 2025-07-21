import type {
  createBankConnectionSchema,
  getBankConnectionsSchema,
} from "~/shared/validators/bank-connection.schema";
import type z from "zod/v4";

import { withTransaction } from "../db";
import { createBankAccountMutation } from "../domain/bank-account/mutations";
import { getBankAccountsQuery } from "../domain/bank-account/queries";
import { createBankConnectionMutation } from "../domain/bank-connection/mutations";

export async function getBankConnections(
  input: z.infer<typeof getBankConnectionsSchema>,
  userId: string,
) {
  return await getBankAccountsQuery({ ...input, userId });
}

export async function createBankConnection(
  input: z.infer<typeof createBankConnectionSchema>,
  userId: string,
) {
  return await withTransaction(async (tx) => {
    const bankConnection = await createBankConnectionMutation(tx, {
      ...input,
      userId,
    });

    if (!bankConnection) return tx.rollback();

    for (const account of input.accounts) {
      await createBankAccountMutation(tx, {
        accountId: account.accountId,
        connectionId: bankConnection.id,
        name: account.name,
        currency: account.currency,
        enabled: account.enabled,
        // type: account.type,
        // accountReference: account.accountReference,
        balance: account.balance ?? 0,
        manual: false,
        userId,
      });
    }

    return bankConnection;
  });
}
