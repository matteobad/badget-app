import type {
  categorizeTransactionSchema,
  createTransactionSchema,
  deleteManyTransactionsSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateManyTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { updateOrCreateRule } from "~/utils/categorization";

import { db, withTransaction } from "../db";
import { updateAttachmentMutation } from "../domain/attachment/mutations";
import { createTransactionToTagMutation } from "../domain/transaction-tag/mutations";
import {
  createTransactionMutation,
  deleteManyTransactionsMutation,
  deleteTransactionMutation,
  updateManyTransactionsMutation,
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
  orgId: string,
) {
  return await getTransactionsQuery(filters, orgId);
}

export async function getTransactionById(id: string, orgId: string) {
  return await getTransactionByIdQuery(id, orgId);
}

export async function getTransactionAmountRange(orgId: string) {
  return await getTransactionAmountRangeQuery(orgId);
}

export async function getTransactionCategoryCounts(orgId: string) {
  return await getTransactionCategoryCountsQuery(orgId);
}

export async function getTransactionTagsCounts(orgId: string) {
  return await getTransactionTagCountsQuery(orgId);
}

export async function getTransactionAccountCounts(orgId: string) {
  return await getTransactionAccountCountsQuery(orgId);
}

export async function createTransaction(
  input: z.infer<typeof createTransactionSchema>,
  orgId: string,
) {
  await withTransaction(async (tx) => {
    // insert transaction
    const inserted = await createTransactionMutation(tx, input, orgId);

    if (!inserted[0]?.id) return tx.rollback();
    const transactionId = inserted[0].id;

    // update transaction attachments
    for (const id of input?.attachment_ids ?? []) {
      const updatedAttachment = { id, orgId, transactionId };
      await updateAttachmentMutation(tx, updatedAttachment, orgId);
    }

    // update transaction tags
    const tags = input?.tags?.map((t) => t.text) ?? [];
    await updateTransactionTagsMutation(tx, { tags, transactionId }, orgId);
  });

  // update category rule relevance
  await updateOrCreateRule(orgId, input.name, input.categoryId);
}

export async function updateTransaction(
  input: z.infer<typeof updateTransactionSchema>,
  orgId: string,
) {
  const transaction = await updateTransactionMutation(input, orgId);
  if (input.categoryId && input.description) {
    await updateOrCreateRule(orgId, input.description, input.categoryId);
  }

  return transaction;
}

export async function updateManyTransactions(
  input: z.infer<typeof updateManyTransactionsSchema>,
  orgId: string,
) {
  const { tagId, ...rest } = input;

  await withTransaction(async (tx) => {
    const transaction = await updateManyTransactionsMutation(tx, {
      ...rest,
      orgId,
    });

    // update category rules
    // if (input.categoryId) {
    //   for (const { name } of transaction) {
    //     await updateOrCreateRule(orgId, name, input.categoryId);
    //   }
    // }

    // update transactionTag
    if (tagId) {
      for (const transactionId of input.ids) {
        await createTransactionToTagMutation(tx, { transactionId, tagId });
      }
    }

    return transaction;
  });
}

export async function deleteTransaction(
  input: z.infer<typeof deleteTransactionSchema>,
  orgId: string,
) {
  return await deleteTransactionMutation(input, orgId);
}

export async function deleteManyTransactions(
  input: z.infer<typeof deleteManyTransactionsSchema>,
  orgId: string,
) {
  return await deleteManyTransactionsMutation(db, {
    ...input,
    orgId,
  });
}

export async function categorizeTransaction(
  input: z.infer<typeof categorizeTransactionSchema>,
  orgId: string,
) {
  return await categorizeTransaction(input, orgId);
}
