"server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  lte,
} from "drizzle-orm";

import type { DBClient } from "~/server/db";
import type {
  DB_AttachmentInsertType,
  DB_TransactionInsertType,
} from "~/server/db/schema/transactions";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { category_table } from "~/server/db/schema/categories";
import {
  attachment_table,
  tag_table,
  tag_table as tagTable,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { type GeTransactionType } from "../utils/search-params";

export function getRecentTransactions_QUERY(userId: string) {
  try {
    return db
      .select({
        ...getTableColumns(transaction_table),
        account: account_table,
        category: category_table,
      })
      .from(transaction_table)
      .leftJoin(
        category_table,
        eq(transaction_table.categoryId, category_table.id),
      )
      .leftJoin(
        account_table,
        eq(transaction_table.accountId, account_table.id),
      )
      .where(eq(transaction_table.userId, userId))
      .limit(9)
      .orderBy(desc(transaction_table.date));
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getTransactions_QUERY(
  input: GeTransactionType,
  userId: string,
) {
  try {
    const offset = (input.page - 1) * input.perPage;
    const fromDate = input.date[0] ? new Date(input.date[0]) : undefined;
    const toDate = input.date[1] ? new Date(input.date[1]) : undefined;
    const minAmount = input.amount[0] ? parseFloat(input.amount[0]) : undefined;
    const maxAmount = input.amount[1] ? parseFloat(input.amount[1]) : undefined;

    const where = and(
      input.description
        ? ilike(transaction_table.description, `%${input.description}%`)
        : undefined,
      input.categoryId.length > 0
        ? inArray(transaction_table.categoryId, input.categoryId)
        : undefined,
      input.accountId.length > 0
        ? inArray(transaction_table.accountId, input.accountId)
        : undefined,
      input.tags.length > 0
        ? inArray(transaction_to_tag_table.tagId, input.tags)
        : undefined,
      fromDate ? gte(transaction_table.date, fromDate) : undefined,
      toDate ? lte(transaction_table.date, toDate) : undefined,
      minAmount
        ? gte(transaction_table.amount, minAmount.toFixed(2))
        : undefined,
      maxAmount
        ? lte(transaction_table.amount, maxAmount.toFixed(2))
        : undefined,
      eq(transaction_table.userId, userId),
    );

    const orderBy =
      input.sort.length > 0
        ? input.sort.map((item) =>
            item.desc
              ? desc(transaction_table[item.id])
              : asc(transaction_table[item.id]),
          )
        : [desc(transaction_table.date)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select({
          ...getTableColumns(transaction_table),
          tags: tag_table,
        })
        .from(transaction_table)
        .leftJoin(
          transaction_to_tag_table,
          and(eq(transaction_table.id, transaction_to_tag_table.transactionId)),
        )
        .leftJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))
        .limit(input.perPage)
        .offset(offset)
        .where(where)
        .orderBy(...orderBy);

      const total = await tx
        .select({
          count: count(),
        })
        .from(transaction_table)
        .leftJoin(
          transaction_to_tag_table,
          and(eq(transaction_table.id, transaction_to_tag_table.transactionId)),
        )
        .leftJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))

        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / input.perPage);
    return { data, pageCount };
  } catch (err) {
    console.error(err);
    return { data: [], pageCount: 0 };
  }
}

export async function getTransactionCategoryCounts_QUERY(userId: string) {
  try {
    return await db
      .select({
        categoryId: transaction_table.categoryId,
        count: count(),
      })
      .from(transaction_table)
      .where(eq(transaction_table.userId, userId))
      .groupBy(transaction_table.categoryId)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { categoryId, count }) => {
            acc[categoryId ?? "null"] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

export async function getTransactionTagCounts_QUERY(userId: string) {
  try {
    return await db
      .select({
        tagId: transaction_to_tag_table.tagId,
        count: count(),
      })
      .from(transaction_table)
      .leftJoin(
        transaction_to_tag_table,
        eq(transaction_to_tag_table.transactionId, transaction_table.id),
      )
      .where(eq(transaction_table.userId, userId))
      .groupBy(transaction_to_tag_table.tagId)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { tagId, count }) => {
            acc[tagId ?? "null"] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

export async function getTransactionAccountCounts_QUERY(userId: string) {
  try {
    return await db
      .select({
        accountId: transaction_table.accountId,
        count: count(),
      })
      .from(transaction_table)
      .where(eq(transaction_table.userId, userId))
      .groupBy(transaction_table.accountId)
      .having(gt(count(), 0))
      .then((res) =>
        res.reduce(
          (acc, { accountId, count }) => {
            acc[accountId] = count;
            return acc;
          },
          {} as Record<string, number>,
        ),
      );
  } catch (err) {
    console.error(err);
    return {} as Record<string, number>;
  }
}

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
      id: transaction_to_tag_table.tagId,
      text: tagTable.text,
    })
    .from(transaction_to_tag_table)
    .innerJoin(tagTable, eq(transaction_to_tag_table.tagId, tagTable.id))
    .where(eq(transaction_to_tag_table.transactionId, transactionId));

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
    await client.insert(transaction_to_tag_table).values(
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
      .delete(transaction_to_tag_table)
      .where(
        and(
          eq(transaction_to_tag_table.transactionId, transactionId),
          inArray(transaction_to_tag_table.tagId, tagIdsToRemove),
        ),
      );

    // Delete tags if they are no longer used
    const unusedTags = await client
      .select({ id: transaction_to_tag_table.tagId })
      .from(transaction_to_tag_table)
      .where(inArray(transaction_to_tag_table.tagId, tagIdsToRemove));

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
