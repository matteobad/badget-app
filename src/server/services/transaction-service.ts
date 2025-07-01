import type {
  categorizeTransactionSchema,
  createTransactionSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { updateOrCreateRule } from "~/utils/categorization";

import { withTransaction } from "../db";
import { updateAttachmentMutation } from "../domain/attachment/mutations";
import {
  createTransactionMutation,
  deleteTransactionMutation,
  updateTransactionMutation,
  updateTransactionTagsMutation,
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
  await withTransaction(async (tx) => {
    // insert transaction
    const inserted = await createTransactionMutation(tx, input, userId);

    if (!inserted[0]?.id) return tx.rollback();
    const transactionId = inserted[0].id;

    // update transaction attachments
    for (const id of input?.attachment_ids ?? []) {
      const updatedAttachment = { id, userId, transactionId };
      await updateAttachmentMutation(tx, updatedAttachment, userId);
    }

    // update transaction tags
    const tags = input?.tags?.map((t) => t.text) ?? [];
    await updateTransactionTagsMutation(tx, { tags, transactionId }, userId);
  });

  // update category rule relevance
  const description = input.description;
  await updateOrCreateRule(userId, description, input.categoryId);
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

export async function categorizeTransaction(
  input: z.infer<typeof categorizeTransactionSchema>,
  userId: string,
) {
  return await categorizeTransaction(input, userId);
}
