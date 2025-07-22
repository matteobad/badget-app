import type {
  createBankConnectionSchema,
  getBankConnectionsSchema,
} from "~/shared/validators/bank-connection.schema";
import type z from "zod/v4";
import { gocardlessClient } from "~/features/account/server/providers/gocardless/gocardless-api";

import { db, withTransaction } from "../db";
import { createBankAccountMutation } from "../domain/bank-account/mutations";
import { getBankAccountsQuery } from "../domain/bank-account/queries";
import { createBankConnectionMutation } from "../domain/bank-connection/mutations";
import { getInstitutionsQuery } from "../domain/institution/queries";

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
  const requisition = await gocardlessClient.getRequisitionById({
    id: input.referenceId,
  });
  const institutions = await getInstitutionsQuery(db, {
    countryCode: "IT",
    originalId: requisition.institution_id,
  });

  return await withTransaction(async (tx) => {
    // TODO: find a better solution to map institution id
    const institutionId = institutions[0]!.id;

    // create bank connection
    const bankConnection = await createBankConnectionMutation(tx, {
      provider: input.provider,
      referenceId: input.referenceId,
      accounts: input.accounts.map((account) => ({
        ...account,
        institutionId,
      })),
      userId,
    });

    if (!bankConnection) return tx.rollback();

    for (const account of input.accounts) {
      await createBankAccountMutation(tx, {
        accountId: account.accountId,
        connectionId: bankConnection.id,
        institutionId: bankConnection.institutionId,
        name: account.name,
        currency: account.currency,
        enabled: account.enabled,
        type: account.type,
        // accountReference: account.accountReference,
        balance: account.balance ?? 0,
        manual: false,
        userId,
      });
    }

    return bankConnection;
  });
}
