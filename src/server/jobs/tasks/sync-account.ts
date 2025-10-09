import { logger, schemaTask } from "@trigger.dev/sdk";
import { subDays } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import {
  calculateFingerprint,
  normalizeDescription,
} from "~/server/domain/transaction/utils";
import { getBankAccountProvider } from "~/server/integrations/open-banking";
import { syncAccountSchema } from "~/shared/validators/tasks.schema";

import { parseAPIError } from "../utils/parse-error";
import { recalculateSnapshotsTask } from "./recalculate-snapshots";
import { upsertTransactions } from "./upsert-transactions";

const BATCH_SIZE = 500;

export const syncAccount = schemaTask({
  id: "sync-account",
  maxDuration: 120,
  retry: {
    maxAttempts: 2,
  },
  schema: syncAccountSchema,
  run: async ({
    id,
    organizationId,
    accountId,
    errorRetries,
    provider,
    manualSync,
  }) => {
    const bankProvider = getBankAccountProvider(provider);

    // Get the balance
    try {
      const balanceData = await bankProvider.getAccountBalance({
        accountId,
      });

      if (!balanceData) {
        throw new Error("Failed to get balance");
      }

      // Only update the balance if it's greater than 0
      const balance = balanceData?.amount ?? 0;

      if (balance > 0) {
        // Reset error details and retries if we successfully got the balance
        await db
          .update(account_table)
          .set({ balance, errorDetails: null, errorRetries: null })
          .where(eq(account_table.id, id));
      } else {
        // Reset error details and retries if we successfully got the balance
        await db
          .update(account_table)
          .set({ errorDetails: null, errorRetries: null })
          .where(eq(account_table.id, id));
      }
    } catch (error) {
      const parsedError = parseAPIError(error);

      logger.error("Failed to sync account balance", { error: parsedError });

      if (parsedError.code === "disconnected") {
        const retries = errorRetries ? errorRetries + 1 : 1;

        // Update the account with the error details and retries
        await db
          .update(account_table)
          .set({ errorDetails: parsedError.message, errorRetries: retries })
          .where(eq(account_table.id, id));

        throw error;
      }
    }

    // Get the transactions
    try {
      const transactionsData = await bankProvider.getTransactions({
        accountId,
        // accountType: classification,
        // If the transactions are being synced manually, we want to get all transactions
        latest: !manualSync,
      });

      if (!transactionsData) {
        throw new Error("Failed to get transactions");
      }

      // Reset error details and retries if we successfully got the transactions
      await db
        .update(account_table)
        .set({ errorDetails: null, errorRetries: null })
        .where(eq(account_table.id, id));

      if (transactionsData.length === 0) {
        logger.info(`No transactions to upsert for account ${accountId}`);
        return;
      }

      // Upsert transactions in batches of 500
      // This is to avoid memory issues with the DB
      for (let i = 0; i < transactionsData.length; i += BATCH_SIZE) {
        const transactionBatch = transactionsData
          .slice(i, i + BATCH_SIZE)
          .map((transaction) => {
            // Create normalized transaction for fingerprint calculation
            const descriptionNormalized = normalizeDescription(
              transaction.name,
            );

            const fingerprint = calculateFingerprint({
              accountId,
              amount: transaction.amount,
              date: new Date(transaction.date),
              descriptionNormalized,
            });

            return {
              ...transaction,
              fingerprint,
            };
          });

        await upsertTransactions.triggerAndWait({
          transactions: transactionBatch,
          organizationId,
          bankAccountId: id,
          manualSync,
        });
      }

      // Get the earliest date for snapshot recalculation
      const dates = transactionsData.map((t) => new Date(t.date));
      const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));

      // Recalculate daily balances snapshots
      await recalculateSnapshotsTask.triggerAndWait({
        accountId: id,
        fromDate: manualSync ? earliestDate : subDays(new Date(), 5),
        organizationId,
      });
    } catch (error) {
      logger.error("Failed to sync transactions", { error });

      throw error;
    }
  },
});
