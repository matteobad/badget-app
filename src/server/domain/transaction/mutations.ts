"server-only";

import { and, eq, inArray, ne } from "drizzle-orm";
import type z from "zod";
import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import {
  transaction_embeddings_table,
  transaction_table,
  transaction_to_tag_table,
} from "~/server/db/schema/transactions";
import type {
  TransactionFrequencyType,
  TransactionStatusType,
} from "~/shared/constants/enum";
import type { deleteTransactionSchema } from "~/shared/validators/transaction.schema";

type UpdateTransactionData = {
  id: string;
  organizationId: string;
  categorySlug?: string | null;
  status?: TransactionStatusType;
  internal?: boolean;
  note?: string | null;
  recurring?: boolean;
  frequency?: TransactionFrequencyType | null;
  name?: string;
  amount?: number;
  currency?: string;
  date?: string;
  bankAccountId?: string;
  fingerprint?: string;
};

export async function updateTransactionMutation(
  db: DBClient,
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
