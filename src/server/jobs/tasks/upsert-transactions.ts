import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { transaction_table } from "~/server/db/schema/transactions";
import {
  TRANSACTION_METHOD,
  TRANSACTION_SOURCE,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";
import { sql } from "drizzle-orm";
import { z } from "zod/v4";

const transactionSchema = z.object({
  fingerprint: z.string(),
  externalId: z.string().nullable().optional(),
  date: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  amount: z.number(),
  currency: z.string(),
  method: z.enum(TRANSACTION_METHOD),
  status: z.enum(TRANSACTION_STATUS).optional(),
  source: z.enum(TRANSACTION_SOURCE).optional(),
  counterpartyName: z.string().nullable().optional(),
});

export const upsertTransactions = schemaTask({
  id: "upsert-transactions",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 10,
  },
  schema: z.object({
    organizationId: z.string(),
    bankAccountId: z.uuid(),
    manualSync: z.boolean().optional(),
    transactions: z.array(transactionSchema),
  }),
  run: async ({ transactions, organizationId, bankAccountId }) => {
    try {
      // const categorizedData = await categorizeTransactions(
      //   organizationId,
      //   transactions,
      // );

      // Upsert transactions into the transactions table, skipping duplicates based on internal_id
      await db
        .insert(transaction_table)
        .values(
          transactions.map((transaction) => ({
            ...transaction,
            accountId: bankAccountId,
            organizationId: organizationId,
          })),
        )
        .onConflictDoUpdate({
          target: [
            transaction_table.organizationId,
            transaction_table.externalId,
          ],
          set: {
            date: sql`excluded.date`,
            name: sql`excluded.name`,
            description: sql`excluded.description`,
            amount: sql`excluded.amount`,
            currency: sql`excluded.currency`,
            method: sql`excluded.method`,
            source: sql`excluded.source`,
            counterpartyName: sql`excluded.counterparty_name`,
            fingerprint: sql`excluded.fingerprint`,
          },
        });
    } catch (error) {
      logger.error("Failed to upsert transactions", { error });

      throw error;
    }
  },
});
