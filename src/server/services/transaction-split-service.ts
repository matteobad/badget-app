import type {
  addTransactionSplitsSchema,
  deleteTransactionSplitSchema,
  getTransactionSplitsSchema,
} from "~/shared/validators/transaction-split.schema";
import type z from "zod/v4";
import { and, desc, eq } from "drizzle-orm";

import type { DBClient } from "../db";
import {
  transaction_category_table,
  transaction_split_table,
  transaction_table,
} from "../db/schema/transactions";

export async function getTransactionSplits(
  client: DBClient,
  input: z.infer<typeof getTransactionSplitsSchema>,
  orgId: string,
) {
  const trx = await client
    .select({
      id: transaction_split_table.id,
      category: {
        id: transaction_category_table.id,
        slug: transaction_category_table.slug,
        name: transaction_category_table.name,
        color: transaction_category_table.color,
        icon: transaction_category_table.icon,
      },
      amount: transaction_split_table.amount,
      note: transaction_split_table.note,
    })
    .from(transaction_split_table)
    .innerJoin(
      transaction_table,
      eq(transaction_table.id, transaction_split_table.transactionId),
    )
    .leftJoin(
      transaction_category_table,
      and(
        eq(
          transaction_category_table.slug,
          transaction_split_table.categorySlug,
        ),
        eq(
          transaction_category_table.organizationId,
          transaction_split_table.organizationId,
        ),
      ),
    )
    .where(
      and(
        eq(transaction_split_table.transactionId, input.transactionId),
        eq(transaction_table.organizationId, orgId),
      ),
    )
    .orderBy(desc(transaction_split_table.amount));

  return trx;
}

export async function addTransactionSplits(
  client: DBClient,
  input: z.infer<typeof addTransactionSplitsSchema>,
  organizationId: string,
) {
  return await client.transaction(async (tx) => {
    // Load transaction and validate org
    const transaction = (
      await tx
        .select({ id: transaction_table.id, amount: transaction_table.amount })
        .from(transaction_table)
        .where(
          and(
            eq(transaction_table.id, input.transactionId),
            eq(transaction_table.organizationId, organizationId),
          ),
        )
        .limit(1)
    )[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Validate splits sum to transaction amount
    const total = input.splits.reduce((acc, s) => acc + s.amount, 0);

    if (Number(total.toFixed(2)) !== Number(transaction.amount.toFixed(2))) {
      throw new Error("Splits must sum to the transaction amount");
    }

    // Exclude transaction from analytics
    await tx
      .update(transaction_table)
      .set({ categorySlug: null, internal: true })
      .where(eq(transaction_table.id, input.transactionId));

    // Replace existing splits
    await tx
      .delete(transaction_split_table)
      .where(eq(transaction_split_table.transactionId, input.transactionId));

    await tx.insert(transaction_split_table).values(
      input.splits.map((s) => ({
        organizationId,
        transactionId: input.transactionId,
        categorySlug: s.category?.slug,
        amount: s.amount,
        note: s.note,
      })),
    );

    return { ok: true } as const;
  });
}

export async function deleteTransactionSplit(
  client: DBClient,
  input: z.infer<typeof deleteTransactionSplitSchema>,
  organizationId: string,
) {
  return await client.transaction(async (tx) => {
    // Resolve split and transaction
    const split = (
      await tx
        .select({
          id: transaction_split_table.id,
          transactionId: transaction_split_table.transactionId,
        })
        .from(transaction_split_table)
        .innerJoin(
          transaction_table,
          eq(transaction_table.id, transaction_split_table.transactionId),
        )
        .where(
          and(
            eq(transaction_split_table.transactionId, input.transactionId),
            eq(transaction_table.organizationId, organizationId),
          ),
        )
        .limit(1)
    )[0];

    if (!split) throw new Error("Splits not found");

    // Delete splis
    await tx
      .delete(transaction_split_table)
      .where(eq(transaction_split_table.transactionId, input.transactionId));

    // include transaction in reports
    await tx
      .update(transaction_table)
      .set({ internal: false })
      .where(eq(transaction_table.id, input.transactionId));

    return { ok: true } as const;
  });
}
