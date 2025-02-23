"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { withTransaction } from "~/server/db";
import { utapi } from "~/server/uploadthing";
import {
  categorizeTransaction,
  updateOrCreateRule,
} from "~/utils/categorization";
import {
  AttachmentDeleteSchema,
  CategorizeTransactionSchema,
  TransactionDeleteSchema,
  TransactionInsertSchema,
  TransactionUpdateSchema,
} from "../utils/schemas";
import {
  createTransaction,
  deleteTransaction,
  deleteTransactionAttachment,
  updateTransaction,
  updateTransactionAttachment,
  updateTransactionTags,
} from "./queries";

// transaction
export const createTransactionAction = authActionClient
  .schema(TransactionInsertSchema)
  .metadata({ actionName: "create-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Prepare data
    const userId = ctx.userId;
    const categoryId = parsedInput.categoryId;

    // Mutate data
    await withTransaction(async (tx) => {
      // update transaction
      const inserted = await createTransaction({ ...parsedInput, userId }, tx);

      if (!inserted[0]?.id) return tx.rollback();
      const transactionId = inserted[0].id;

      for (const id of parsedInput.attachment_ids) {
        const updatedAttachment = { id, userId, transactionId };
        await updateTransactionAttachment(updatedAttachment, tx);
      }

      // update transaction tags
      const tags = parsedInput.tags.map((t) => t.text);
      await updateTransactionTags(tags, transactionId, userId, tx);

      // update category rule relevance
      const description = parsedInput.description;
      await updateOrCreateRule(userId, description, categoryId);
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "create-transaction-success-message" };
  });

export const updateTransactionAction = authActionClient
  .schema(TransactionUpdateSchema)
  .metadata({ actionName: "update-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Prepare data
    const userId = ctx.userId;
    const transactionId = parsedInput.id;
    const categoryId = parsedInput.categoryId;

    // Mutate data
    await withTransaction(async (tx) => {
      // update transaction
      await updateTransaction({ ...parsedInput, userId }, tx);

      // update transaction attachements
      for (const id of parsedInput.attachment_ids) {
        const updatedAttachment = { id, userId, transactionId };
        await updateTransactionAttachment(updatedAttachment, tx);
      }

      // update transaction tags
      const tags = parsedInput.tags.map((t) => t.text);
      await updateTransactionTags(tags, transactionId, userId, tx);

      // TODO: only id category has changed
      // update category rule relevance
      const description = parsedInput.description;
      await updateOrCreateRule(userId, description, categoryId);
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "update-transaction-success-message" };
  });

export const deleteTransactionAction = authActionClient
  .schema(TransactionDeleteSchema)
  .metadata({ actionName: "delete-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await withTransaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await deleteTransaction(id, ctx.userId, tx);
      }
    });

    // Invalidate cache
    revalidateTag(`transaction_${ctx.userId}`);

    // Return success message
    return { message: "delete-transaction-success-message" };
  });

export const deleteTransactionAttachmentAction = authActionClient
  .schema(AttachmentDeleteSchema)
  .metadata({ actionName: "delete-transaction-attachment" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    // TODO: attachment can be associated to multiple transactions
    // remove it only if it's not associated with anything
    await deleteTransactionAttachment(parsedInput.id, ctx.userId);
    await utapi.deleteFiles(parsedInput.fileKey);

    // Invalidate cache
    revalidateTag(`attachment_${ctx.userId}`);

    // Return success message
    return { message: "delete-attachment-success-message" };
  });

export const categorizeTransactionAction = authActionClient
  .schema(CategorizeTransactionSchema)
  .metadata({ actionName: "categorize-transaction" })
  .action(async ({ parsedInput, ctx }) => {
    const categoryId = await categorizeTransaction(ctx.userId, parsedInput);
    return { categoryId };
  });
