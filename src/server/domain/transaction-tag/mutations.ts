"server-only";

import type { DBClient } from "~/server/db";
import type { DB_TransactionToTagInsertType } from "~/server/db/schema/transactions";
import { transaction_to_tag_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createTransactionToTagMutation(
  client: DBClient,
  input: DB_TransactionToTagInsertType,
) {
  return await client
    .insert(transaction_to_tag_table)
    .values({ ...input })
    .onConflictDoNothing()
    .returning();
}

export async function deleteTransactionToTagMutation(
  client: DBClient,
  input: { tagId: string; transactionId: string },
) {
  return await client
    .delete(transaction_to_tag_table)
    .where(
      and(
        eq(transaction_to_tag_table.tagId, input.tagId),
        eq(transaction_to_tag_table.transactionId, input.transactionId),
      ),
    );
}
