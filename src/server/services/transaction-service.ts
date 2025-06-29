import type {
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";

import {
  deleteTransactionMutation,
  updateTransactionMutation,
} from "../domain/transaction/mutations";
import {
  getTransactionByIdQuery,
  getTransactionsQuery,
} from "../domain/transaction/queries";

export async function getTransactions(
  filters: z.infer<typeof getTransactionsSchema>,
  userId: string,
) {
  return await getTransactionsQuery(filters, userId);
}

export async function getTransactionById(id: string, userId: string) {
  return await getTransactionByIdQuery(id, userId);
}

export async function updateTransaction(
  input: z.infer<typeof updateTransactionSchema>,
  userId: string,
) {
  return await updateTransactionMutation(input, userId);
}

export async function deleteTransaction(
  input: z.infer<typeof deleteTransactionSchema>,
  userId: string,
) {
  return await deleteTransactionMutation(input, userId);
}
