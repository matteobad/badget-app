import type {
  createManualBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountByIdSchema,
  getBankAccountsSchema,
  updateBankAccountSchema,
} from "~/shared/validators/bank-account.schema";
import type z from "zod/v4";

import type { DBClient } from "../db";
import { db } from "../db";
import {
  createBankAccountMutation,
  deleteBankAccountMutation,
  updateBankAccountMutation,
} from "../domain/bank-account/mutations";
import {
  getBankAccountByIdQuery,
  getBankAccountsQuery,
} from "../domain/bank-account/queries";
import { recalculateSnapshots } from "./balance-snapshots-service";

export async function getBankAccounts(
  input: z.infer<typeof getBankAccountsSchema>,
  orgId: string,
) {
  return await getBankAccountsQuery({ ...input, orgId });
}

export async function getBankAccountById(
  input: z.infer<typeof getBankAccountByIdSchema>,
  orgId: string,
) {
  return await getBankAccountByIdQuery({ ...input, orgId });
}

export async function createManualBankAccount(
  db: DBClient,
  input: z.infer<typeof createManualBankAccountSchema>,
  organizationId: string,
) {
  return await db.transaction(async (tx) => {
    const bankAccount = await createBankAccountMutation(tx, {
      ...input,
      openingBalance: input.balance,
      t0Datetime: new Date().toISOString(),
      manual: true,
      organizationId,
    });

    if (!bankAccount) {
      console.error("No bank account created");
      return tx.rollback();
    }

    // Recalculate snapshots from the affected date
    await recalculateSnapshots(
      tx,
      { accountId: bankAccount.id, fromDate: new Date() },
      organizationId,
    );

    return bankAccount;
  });
}

export async function updateBankAccount(
  input: z.infer<typeof updateBankAccountSchema>,
  orgId: string,
) {
  return await updateBankAccountMutation(db, { ...input, orgId });
}

export async function deleteBankAccount(
  db: DBClient,
  input: z.infer<typeof deleteBankAccountSchema>,
  orgId: string,
) {
  await deleteBankAccountMutation(db, { ...input, orgId });
}
