"server-only";

import type { DBClient, TXType } from "~/server/db";
import type {
  TransactionFrequencyType,
  TransactionStatusType,
} from "~/shared/constants/enum";
import type {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionTagsSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import {
  tag_table,
  transaction_embeddings_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import { and, eq, inArray, ne } from "drizzle-orm";

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

type UpdateTransactionData = {
  id: string;
  organizationId: string;
  categorySlug?: string | null;
  status?: TransactionStatusType;
  internal?: boolean;
  note?: string | null;
  assignedId?: string | null;
  recurring?: boolean;
  frequency?: TransactionFrequencyType | null;
};

export async function updateTransactionMutation(
  client: DBClient,
  params: UpdateTransactionData,
) {
  const { id, organizationId, ...dataToUpdate } = params;

  const [result] = await db
    .update(transaction_table)
    .set(dataToUpdate)
    .where(
      and(
        eq(transaction_table.id, id),
        eq(transaction_table.organizationId, organizationId),
      ),
    )
    .returning({
      id: transaction_table.id,
    });

  if (!result) {
    return null;
  }

  return result;
}

type UpdateTransactionsData = {
  ids: string[];
  organizationId: string;
  categorySlug?: string | null;
  status?: TransactionStatusType;
  internal?: boolean;
  note?: string | null;
  assignedId?: string | null;
  tagId?: string | null;
  recurring?: boolean;
  frequency?: TransactionFrequencyType | null;
};

export async function updateManyTransactionsMutation(
  client: DBClient,
  data: UpdateTransactionsData,
) {
  const { ids, tagId, organizationId, ...input } = data;

  if (tagId) {
    await client
      .insert(transaction_to_tag_table)
      .values(
        ids.map((id) => ({
          transactionId: id,
          tagId,
          organizationId,
        })),
      )
      .onConflictDoNothing();
  }

  let results: { id: string }[] = [];

  // Only update transactions if there are fields to update
  if (Object.keys(input).length > 0) {
    results = await client
      .update(transaction_table)
      .set(input)
      .where(
        and(
          eq(transaction_table.organizationId, organizationId),
          inArray(transaction_table.id, ids),
        ),
      )
      .returning({
        id: transaction_table.id,
      });
  } else {
    // If no fields to update, just return the transaction IDs
    results = ids.map((id) => ({ id }));
  }

  // Filter out any null results
  return results.filter((transaction) => transaction !== null);
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
        ne(transaction_table.source, "api"),
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

export type CreateTransactionEmbeddingParams = {
  transactionId: string;
  organizationId: string;
  embedding: number[];
  sourceText: string;
  model: string;
};

export async function createTransactionEmbeddings(
  db: DBClient,
  params: CreateTransactionEmbeddingParams[],
) {
  if (params.length === 0) {
    return [];
  }

  return db.insert(transaction_embeddings_table).values(params).returning({
    id: transaction_embeddings_table.id,
    transactionId: transaction_embeddings_table.transactionId,
  });
}
