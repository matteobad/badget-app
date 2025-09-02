import type {
  addTransactionSplitsSchema,
  deleteTransactionSplitSchema,
  getTransactionSplitsSchema,
  updateTransactionSplitSchema,
} from "~/shared/validators/transaction-split.schema";
import type z from "zod/v4";
import { and, eq, sum } from "drizzle-orm";

import type { DBClient } from "../db";
import { category_table } from "../db/schema/categories";
import {
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
        id: category_table.id,
        slug: category_table.slug,
        name: category_table.name,
        color: category_table.color,
        icon: category_table.icon,
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
      category_table,
      eq(category_table.id, transaction_split_table.categoryId),
    )
    .where(
      and(
        eq(transaction_split_table.transactionId, input.transactionId),
        eq(transaction_table.organizationId, orgId),
      ),
    );

  return trx;
}

export async function addTransactionSplits(
  client: DBClient,
  input: z.infer<typeof addTransactionSplitsSchema>,
  orgId: string,
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
            eq(transaction_table.organizationId, orgId),
          ),
        )
        .limit(1)
    )[0];

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const total = input.splits.reduce((acc, s) => acc + s.amount, 0);
    if (Number(total.toFixed(2)) !== Number(transaction.amount.toFixed(2))) {
      throw new Error("Splits must sum to the transaction amount");
    }

    // Replace existing splits
    await tx
      .delete(transaction_split_table)
      .where(eq(transaction_split_table.transactionId, input.transactionId));

    await tx.insert(transaction_split_table).values(
      input.splits.map((s) => ({
        transactionId: input.transactionId,
        categoryId: s.categoryId,
        amount: s.amount,
        note: s.note,
      })),
    );

    return { ok: true } as const;
  });
}

export async function updateTransactionSplit(
  client: DBClient,
  input: z.infer<typeof updateTransactionSplitSchema>,
  orgId: string,
) {
  return await client.transaction(async (tx) => {
    // Ensure split belongs to org via join
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
            eq(transaction_split_table.id, input.splitId),
            eq(transaction_table.organizationId, orgId),
          ),
        )
        .limit(1)
    )[0];

    if (!split) throw new Error("Split not found");

    await tx
      .update(transaction_split_table)
      .set(input.data)
      .where(eq(transaction_split_table.id, input.splitId));

    // Validate new total still matches transaction amount
    const [sumRow] = await tx
      .select({ total: sum(transaction_split_table.amount) })
      .from(transaction_split_table)
      .where(eq(transaction_split_table.transactionId, split.transactionId));

    const [trx] = await tx
      .select({ amount: transaction_table.amount })
      .from(transaction_table)
      .where(eq(transaction_table.id, split.transactionId))
      .limit(1);

    const total = Number(Number(sumRow?.total ?? "0").toFixed(2));
    if (Number(trx?.amount.toFixed(2)) !== total) {
      throw new Error("Splits must sum to the transaction amount");
    }

    return { ok: true } as const;
  });
}

export async function deleteTransactionSplit(
  client: DBClient,
  input: z.infer<typeof deleteTransactionSplitSchema>,
  orgId: string,
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
            eq(transaction_split_table.id, input.splitId),
            eq(transaction_table.organizationId, orgId),
          ),
        )
        .limit(1)
    )[0];

    if (!split) throw new Error("Split not found");

    await tx
      .delete(transaction_split_table)
      .where(eq(transaction_split_table.id, input.splitId));

    // After deletion, if there are remaining splits, they must still sum to amount
    const [sumRow] = await tx
      .select({ total: sum(transaction_split_table.amount) })
      .from(transaction_split_table)
      .where(eq(transaction_split_table.transactionId, split.transactionId));

    const [trx] = await tx
      .select({ amount: transaction_table.amount })
      .from(transaction_table)
      .where(eq(transaction_table.id, split.transactionId))
      .limit(1);

    const total = Number(Number(sumRow?.total ?? 0).toFixed(2));
    if (total !== 0 && Number(trx?.amount.toFixed(2)) !== total) {
      throw new Error("Splits must sum to the transaction amount");
    }

    return { ok: true } as const;
  });
}
