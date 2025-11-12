import type z from "zod";
import type {
  createManualBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountByIdSchema,
  getBankAccountsSchema,
  updateBankAccountBalanceSchema,
  updateBankAccountSchema,
} from "~/shared/validators/bank-account.schema";

import type { DBClient } from "../db";
import {
  createBankAccountMutation,
  deleteBankAccountMutation,
  updateBankAccountMutation,
} from "../domain/bank-account/mutations";
import {
  getBankAccountByIdQuery,
  getBankAccountsQuery,
} from "../domain/bank-account/queries";
import {
  recalculateSnapshots,
  updateAccountBalance,
} from "./balance-snapshots-service";

export async function getBankAccounts(
  db: DBClient,
  input: z.infer<typeof getBankAccountsSchema>,
  organizationId: string,
) {
  return await getBankAccountsQuery(db, { ...input, organizationId });
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
  db: DBClient,
  input: z.infer<typeof updateBankAccountSchema>,
  orgId: string,
) {
  return await updateBankAccountMutation(db, { ...input, orgId });
}

export async function updateManualBankAccountBalance(
  db: DBClient,
  input: z.infer<typeof updateBankAccountBalanceSchema>,
  organizationId: string,
) {
  await db.transaction(async (tx) => {
    // Recalculate snapshots from the affected date
    await recalculateSnapshots(
      tx,
      { accountId: input.id, fromDate: new Date(input.date) },
      organizationId,
    );

    // Update account balance
    await updateAccountBalance(tx, { accountId: input.id }, organizationId);
  });
}

export async function deleteBankAccount(
  db: DBClient,
  input: z.infer<typeof deleteBankAccountSchema>,
  orgId: string,
) {
  await deleteBankAccountMutation(db, { ...input, orgId });
}
