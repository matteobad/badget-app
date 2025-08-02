import type {
  createBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountByIdSchema,
  getBankAccountsSchema,
  updateBankAccountSchema,
} from "~/shared/validators/bank-account.schema";
import type z from "zod/v4";

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
  input: z.infer<typeof createBankAccountSchema>,
  orgId: string,
) {
  return await createBankAccountMutation(db, { ...input, orgId });
}

export async function updateBankAccount(
  input: z.infer<typeof updateBankAccountSchema>,
  orgId: string,
) {
  return await updateBankAccountMutation(db, { ...input, orgId });
}

export async function deleteBankAccount(
  input: z.infer<typeof deleteBankAccountSchema>,
  orgId: string,
) {
  return await deleteBankAccountMutation(db, { ...input, orgId });
}
