import type {
  createTransactionSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";

import {
  createTransactionMutation,
  deleteTransactionMutation,
  updateTransactionMutation,
} from "../domain/transaction/mutations";
import {
  getTransactionAccountCountsQuery,
  getTransactionAmountRangeQuery,
  getTransactionByIdQuery,
  getTransactionCategoryCountsQuery,
  getTransactionsQuery,
  getTransactionTagCountsQuery,
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

export async function getTransactionAmountRange(userId: string) {
  return await getTransactionAmountRangeQuery(userId);
}

export async function getTransactionCategoryCounts(userId: string) {
  return await getTransactionCategoryCountsQuery(userId);
}

export async function getTransactionTagsCounts(userId: string) {
  return await getTransactionTagCountsQuery(userId);
}

export async function getTransactionAccountCounts(userId: string) {
  return await getTransactionAccountCountsQuery(userId);
}

export async function createTransaction(
  input: z.infer<typeof createTransactionSchema>,
  userId: string,
) {
  return await createTransactionMutation(input, userId);
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
