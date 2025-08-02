"server-only";

import type { DBClient, TXType } from "~/server/db";
import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import type {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionSchema,
  updateTransactionTagsSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import {
  tag_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { and, eq, inArray } from "drizzle-orm";

export async function createTransactionMutation(
  tx: TXType,
  input: z.infer<typeof createTransactionSchema>,
  orgId: string,
) {
  return await tx
    .insert(transaction_table)
    .values({ ...input, organizationId: orgId })
    .returning();
}

export async function updateTransactionMutation(
  input: z.infer<typeof updateTransactionSchema>,
  orgId: string,
) {
  const { id, ...rest } = input;
  await db
    .update(transaction_table)
    .set(rest)
    .where(
      and(
        eq(transaction_table.id, id),
        eq(transaction_table.organizationId, orgId),
      ),
    );
}

export async function updateManyTransactionsMutation(
  client: DBClient,
  input: Partial<DB_TransactionInsertType> & { ids: string[]; orgId: string },
) {
  const { ids, ...rest } = input;
  return await client
    .update(transaction_table)
    .set(rest)
    .where(
      and(
        inArray(transaction_table.id, ids),
        eq(transaction_table.organizationId, input.orgId),
      ),
    )
    .returning();
}

export async function updateTransactionTagsMutation(
  tx: DBClient,
  input: z.infer<typeof updateTransactionTagsSchema>,
  orgId: string,
) {
  const { transactionId, tags } = input;

  const existingTags = await tx
    .select({
      id: transaction_to_tag_table.tagId,
      text: tag_table.text,
    })
    .from(transaction_to_tag_table)
    .innerJoin(tag_table, eq(transaction_to_tag_table.tagId, tag_table.id))
    .where(eq(transaction_to_tag_table.transactionId, transactionId));
  const existingTagNames = existingTags.map((t) => t.text);

  // Determine tags to add and remove
  const tagsToAdd = tags.filter((name) => !existingTagNames.includes(name));
  const tagsToRemove = existingTags.filter((tag) => !tags.includes(tag.text));

  let newTagIds: string[] = [];

  // Create tags if they don’t exist
  if (tagsToAdd.length > 0) {
    const existingTagRecords = await tx
      .select({ id: tag_table.id, name: tag_table.text })
      .from(tag_table)
      .where(inArray(tag_table.text, tagsToAdd));

    const existingTagMap = new Map(
      existingTagRecords.map((t) => [t.name, t.id]),
    );

    const tagsToInsert = tagsToAdd.filter((name) => !existingTagMap.has(name));

    if (tagsToInsert.length > 0) {
      const insertedTags = await tx
        .insert(tag_table)
        .values(tagsToInsert.map((text) => ({ text, organizationId: orgId })))
        .returning({ id: tag_table.id, text: tag_table.text });

      insertedTags.forEach(({ id, text }) => existingTagMap.set(text, id));
    }

    newTagIds = tagsToAdd.map((name) => existingTagMap.get(name)!);
  }

  // Insert new tag associations
  if (newTagIds.length > 0) {
    await tx.insert(transaction_to_tag_table).values(
      newTagIds.map((tagId) => ({
        transactionId,
        tagId,
      })),
    );
  }

  // Remove old tag associations
  if (tagsToRemove.length > 0) {
    const tagIdsToRemove = tagsToRemove.map((tag) => tag.id);

    await tx
      .delete(transaction_to_tag_table)
      .where(
        and(
          eq(transaction_to_tag_table.transactionId, transactionId),
          inArray(transaction_to_tag_table.tagId, tagIdsToRemove),
        ),
      );

    // Delete tags if they are no longer used
    const unusedTags = await tx
      .select({ id: transaction_to_tag_table.tagId })
      .from(transaction_to_tag_table)
      .where(inArray(transaction_to_tag_table.tagId, tagIdsToRemove));

    const unusedTagIds = tagIdsToRemove.filter(
      (id) => !unusedTags.some((t) => t.id === id),
    );

    if (unusedTagIds.length > 0) {
      await tx.delete(tag_table).where(inArray(tag_table.id, unusedTagIds));
    }
  }
}

export async function deleteTransactionMutation(
  input: z.infer<typeof deleteTransactionSchema>,
  orgId: string,
) {
  return db
    .delete(transaction_table)
    .where(
      and(
        eq(transaction_table.id, input.id),
        eq(transaction_table.manual, true),
        eq(transaction_table.organizationId, orgId),
      ),
    )
    .returning({
      id: transaction_table.id,
    });
}

export async function deleteManyTransactionsMutation(
  client: DBClient,
  input: { ids: string[]; orgId: string },
) {
  return await client
    .delete(transaction_table)
    .where(
      and(
        inArray(transaction_table.id, input.ids),
        eq(transaction_table.organizationId, input.orgId),
      ),
    );
}
