"server-only";

import { and, desc, eq, getTableColumns, inArray } from "drizzle-orm";

import type { DBClient } from "~/server/db";
import type {
  DB_AttachmentInsertType,
  DB_TransactionInsertType,
} from "~/server/db/schema/transactions";
import { db } from "~/server/db";
import { account_table as accountTable } from "~/server/db/schema/accounts";
import { category_table as categoryTable } from "~/server/db/schema/categories";
import {
  attachment_table,
  tag_table as tagTable,
  transaction_table,
  transaction_to_tag_table as transactionToTagTable,
} from "~/server/db/schema/transactions";

export const getTransactionForUser = (userId: string) => {
  return db
    .select({
      ...getTableColumns(transaction_table),
      account: accountTable,
      category: categoryTable,
      tags: tagTable,
    })
    .from(transaction_table)
    .innerJoin(accountTable, eq(transaction_table.accountId, accountTable.id))
    .leftJoin(categoryTable, eq(transaction_table.categoryId, categoryTable.id))
    .leftJoin(
      transactionToTagTable,
      eq(transaction_table.id, transactionToTagTable.transactionId),
    ) // Join transaction_tags
    .leftJoin(tagTable, eq(transactionToTagTable.tagId, tagTable.id)) // Join with tags
    .where(eq(transaction_table.userId, userId))
    .orderBy(desc(transaction_table.date), desc(transaction_table.createdAt));
};

export const getTransactionById = (transactionId: string) => {
  return db
    .select()
    .from(transaction_table)
    .where(eq(transaction_table.id, transactionId));
};

export const createTransaction = (
  transaction: DB_TransactionInsertType,
  client: DBClient = db,
) => {
  if (!transaction.userId) throw new Error("invalid transaction");

  return client
    .insert(transaction_table)
    .values(transaction)
    .returning({ id: transaction_table.id });
};

export const updateTransaction = (
  transaction: Partial<DB_TransactionInsertType>,
  client: DBClient = db,
) => {
  if (!transaction.id || !transaction.userId)
    throw new Error("invalid transaction");

  return client
    .update(transaction_table)
    .set(transaction)
    .where(
      and(
        eq(transaction_table.id, transaction.id),
        eq(transaction_table.userId, transaction.userId),
      ),
    );
};

export const updateTransactionAttachment = (
  attachment: Partial<DB_AttachmentInsertType>,
  client: DBClient = db,
) => {
  if (!attachment.id || !attachment.userId || !attachment.transactionId)
    throw new Error("invalid attachment");

  return client
    .update(attachment_table)
    .set(attachment)
    .where(
      and(
        eq(attachment_table.id, attachment.id),
        eq(attachment_table.userId, attachment.userId),
      ),
    );
};

export const updateTransactionTags = async (
  tags: string[],
  transactionId: string,
  userId: string,
  client: DBClient,
) => {
  const existingTags = await client
    .select({
      id: transactionToTagTable.tagId,
      text: tagTable.text,
    })
    .from(transactionToTagTable)
    .innerJoin(tagTable, eq(transactionToTagTable.tagId, tagTable.id))
    .where(eq(transactionToTagTable.transactionId, transactionId));

  const existingTagNames = existingTags.map((t) => t.text);

  // Determine tags to add and remove
  const tagsToAdd = tags.filter((name) => !existingTagNames.includes(name));
  const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag.text));

  let newTagIds: string[] = [];

  // Create tags if they don’t exist
  if (tagsToAdd.length > 0) {
    const existingTagRecords = await client
      .select({ id: tagTable.id, name: tagTable.text })
      .from(tagTable)
      .where(inArray(tagTable.text, tagsToAdd));

    const existingTagMap = new Map(
      existingTagRecords.map((t) => [t.name, t.id]),
    );

    const tagsToInsert = tagsToAdd.filter((name) => !existingTagMap.has(name));

    if (tagsToInsert.length > 0) {
      const insertedTags = await client
        .insert(tagTable)
        .values(tagsToInsert.map((text) => ({ text, userId })))
        .returning({ id: tagTable.id, text: tagTable.text });

      insertedTags.forEach(({ id, text }) => existingTagMap.set(text, id));
    }

    newTagIds = tagsToAdd.map((name) => existingTagMap.get(name)!);
  }

  // Insert new tag associations
  if (newTagIds.length > 0) {
    await client.insert(transactionToTagTable).values(
      newTagIds.map((tagId) => ({
        transactionId,
        tagId,
      })),
    );
  }

  // Remove old tag associations
  if (tagsToRemove.length > 0) {
    const tagIdsToRemove = tagsToRemove.map((tag) => tag.id);

    await client
      .delete(transactionToTagTable)
      .where(
        and(
          eq(transactionToTagTable.transactionId, transactionId),
          inArray(transactionToTagTable.tagId, tagIdsToRemove),
        ),
      );

    // Delete tags if they are no longer used
    const unusedTags = await client
      .select({ id: transactionToTagTable.tagId })
      .from(transactionToTagTable)
      .where(inArray(transactionToTagTable.tagId, tagIdsToRemove));

    const unusedTagIds = tagIdsToRemove.filter(
      (id) => !unusedTags.some((t) => t.id === id),
    );

    if (unusedTagIds.length > 0) {
      await client.delete(tagTable).where(inArray(tagTable.id, unusedTagIds));
    }
  }
};

export const deleteTransaction = (
  id: string,
  userId: string,
  client: DBClient = db,
) => {
  return client
    .delete(transaction_table)
    .where(
      and(eq(transaction_table.id, id), eq(transaction_table.userId, userId)),
    );
};

export const deleteTransactionAttachment = (
  id: string,
  userId: string,
  client: DBClient = db,
) => {
  return client
    .delete(attachment_table)
    .where(
      and(eq(attachment_table.id, id), eq(attachment_table.userId, userId)),
    );
};
