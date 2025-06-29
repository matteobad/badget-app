"server-only";

import type {
  createTransactionSchema,
  deleteTransactionSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function createTransactionMutation(
  input: z.infer<typeof createTransactionSchema>,
  userId: string,
) {
  return await db
    .insert(transaction_table)
    .values({ ...input, userId })
    .returning();
}

export async function updateTransactionMutation(
  input: z.infer<typeof updateTransactionSchema>,
  userId: string,
) {
  const { id, ...rest } = input;
  await db
    .update(transaction_table)
    .set(rest)
    .where(
      and(eq(transaction_table.id, id), eq(transaction_table.userId, userId)),
    );
}

export async function deleteTransactionMutation(
  input: z.infer<typeof deleteTransactionSchema>,
  userId: string,
) {
  return db
    .delete(transaction_table)
    .where(
      and(
        eq(transaction_table.id, input.id),
        eq(transaction_table.manual, true),
        eq(transaction_table.userId, userId),
      ),
    )
    .returning({
      id: transaction_table.id,
    });
}
