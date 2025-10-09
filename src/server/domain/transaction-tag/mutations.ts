"server-only";

import { and, eq } from "drizzle-orm";
import type { DBClient } from "~/server/db";
import { transaction_to_tag_table } from "~/server/db/schema/transactions";

type CreateTransactionTagParams = {
  organizationId: string;
  transactionId: string;
  tagId: string;
};

export async function createTransactionTagMutation(
  db: DBClient,
  params: CreateTransactionTagParams,
) {
  return db
    .insert(transaction_to_tag_table)
    .values({
      organizationId: params.organizationId,
      transactionId: params.transactionId,
      tagId: params.tagId,
    })
    .returning();
}

type DeleteTransactionTagParams = {
  transactionId: string;
  tagId: string;
  organizationId: string;
};

export async function deleteTransactionTagMutation(
  db: DBClient,
  params: DeleteTransactionTagParams,
) {
  const { transactionId, tagId, organizationId } = params;

  return db
    .delete(transaction_to_tag_table)
    .where(
      and(
        eq(transaction_to_tag_table.transactionId, transactionId),
        eq(transaction_to_tag_table.tagId, tagId),
        eq(transaction_to_tag_table.organizationId, organizationId),
      ),
    );
}
