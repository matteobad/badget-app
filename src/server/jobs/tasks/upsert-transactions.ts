import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { db } from "~/server/db";
import {
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} from "~/server/db/schema/enum";
import { transaction_table } from "~/server/db/schema/transactions";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import { categorizeTransactions } from "~/utils/categorization";
import { z } from "zod/v4";

const transactionSchema = z.object({
  description: z.string().nullable().optional(),
  method: z.enum(TRANSACTION_METHOD),
  date: z.string(),
  name: z.string(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  counterpartyName: z.string().nullable().optional(),
  currency: z.string(),
  amount: z.number(),
});

export const upsertTransactions = schemaTask({
  id: "upsert-transactions",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 10,
  },
  schema: z.object({
    userId: z.uuid(),
    bankAccountId: z.uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  run: async ({ transactions, userId, bankAccountId }) => {
    try {
      const categorizedData = await categorizeTransactions(
        userId,
        transactions,
      );

      // Upsert transactions into the transactions table, skipping duplicates based on internal_id
      await db
        .insert(transaction_table)
        .values(
          // @ts-expect-error type is messeded up by categorizeTransactions
          categorizedData.map((transaction) => ({
            ...transaction,
            accountId: bankAccountId,
            userId: userId,
          })),
        )
        .onConflictDoUpdate({
          target: [transaction_table.userId, transaction_table.rawId],
          set: buildConflictUpdateColumns(transaction_table, [
            "amount",
            "currency",
            "date",
            "name",
            "description",
          ]),
        });
    } catch (error) {
      logger.error("Failed to upsert transactions", { error });

      throw error;
    }
  },
});
