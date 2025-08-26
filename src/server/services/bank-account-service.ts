import type {
  createBankAccountSchema,
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

export async function createBankAccount(
  db: DBClient,
  input: z.infer<typeof createBankAccountSchema>,
  orgId: string,
) {
  return await db.transaction(async (tx) => {
    const bankAccount = await createBankAccountMutation(tx, {
      ...input,
      orgId,
    });

    if (!bankAccount) {
      console.error("No bank account created");
      return tx.rollback();
    }

    // await createBankAccountBalanceMutation(tx, {
    //   accountId: bankAccount.id,
    //   balance: input.balance,
    //   currency: input.currency,
    //   date: bankAccount.createdAt,
    //   organizationId: orgId,
    // });
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
