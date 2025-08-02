import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import { buildConflictUpdateColumns } from "~/server/db/utils";
import {
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";
import { categorizeTransactions } from "~/utils/categorization";
import { z } from "zod/v4";

const transactionSchema = z.object({
  rawId: z.string().nullable().optional(),
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
    orgId: z.string(),
    bankAccountId: z.uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  run: async ({ transactions, orgId, bankAccountId }) => {
    try {
      const categorizedData = await categorizeTransactions(orgId, transactions);

      // Upsert transactions into the transactions table, skipping duplicates based on internal_id
      await db
        .insert(transaction_table)
        .values(
          // @ts-expect-error type is messeded up by categorizeTransactions
          categorizedData.map((transaction) => ({
            ...transaction,
            accountId: bankAccountId,
            organizationId: orgId,
          })),
        )
        .onConflictDoUpdate({
          target: [transaction_table.organizationId, transaction_table.rawId],
          set: buildConflictUpdateColumns(transaction_table, [
            "amount",
            "currency",
            "date",
            "name",
            "description",
            "note",
          ]),
        });
    } catch (error) {
      logger.error("Failed to upsert transactions", { error });

      throw error;
    }
  },
});
