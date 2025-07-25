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
  userId: string,
) {
  return await getBankAccountsQuery({ ...input, userId });
}

export async function getBankAccountById(
  input: z.infer<typeof getBankAccountByIdSchema>,
  userId: string,
) {
  return await getBankAccountByIdQuery({ ...input, userId });
}

export async function createBankAccount(
  input: z.infer<typeof createBankAccountSchema>,
  userId: string,
) {
  return await createBankAccountMutation(db, { ...input, userId });
}

export async function updateBankAccount(
  input: z.infer<typeof updateBankAccountSchema>,
  userId: string,
) {
  return await updateBankAccountMutation(db, { ...input, userId });
}

export async function deleteBankAccount(
  input: z.infer<typeof deleteBankAccountSchema>,
  userId: string,
) {
  return await deleteBankAccountMutation(db, { ...input, userId });
}
