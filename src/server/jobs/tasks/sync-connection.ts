import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import { getBankConnectionByIdQuery } from "~/server/domain/bank-connection/queries";
import { getBankAccountProvider } from "~/server/integrations/open-banking";
import { syncConnectionSchema } from "~/shared/validators/tasks.schema";
import { and, eq } from "drizzle-orm";

import { triggerSequenceAndWait } from "../utils/trigger-sequence";
import { syncAccount } from "./sync-account";

// Fan-out pattern. We want to trigger a task for each bank account (Transactions, Balance)
export const syncConnection = schemaTask({
  id: "sync-connection",
  maxDuration: 120,
  retry: {
    maxAttempts: 2,
  },
  schema: syncConnectionSchema,
  run: async ({ connectionId, manualSync }, { ctx }) => {
    try {
      const data = await getBankConnectionByIdQuery(connectionId);

      if (!data) {
        logger.error("Connection not found");
        throw new Error("Connection not found");
      }

      if (!data.referenceId) {
        logger.error("Connection not linked");
        throw new Error("Connection not linked");
      }

      const provider = getBankAccountProvider(data.provider);
      const connectionData = await provider.getConnectionStatus({
        id: data.referenceId,
      });

      logger.info("Connection response", { connectionData });

      if (connectionData.status === "connected") {
        await db
          .update(connection_table)
          .set({ status: "connected" })
          .where(eq(connection_table.id, connectionId));

        const bankAccountsData = await db
          .select({
            id: account_table.id,
            accountId: account_table.rawId,
            organizationId: account_table.organizationId,
            type: account_table.type,
          })
          .from(account_table)
          .where(
            and(
              eq(account_table.connectionId, connectionId),
              eq(account_table.manual, false),
              eq(account_table.enabled, true),
            ),
          );

        // Skip accounts with more than 3 error retries during background sync
        // Allow all accounts during manual sync to clear errors after reconnect
        // if (!manualSync) {
        //   query.or("error_retries.lt.4,error_retries.is.null");
        // }

        if (bankAccountsData?.length === 0) {
          logger.info("No bank accounts found");
          return;
        }

        const bankAccounts = bankAccountsData.map((account) => ({
          id: account.id,
          accountId: account.accountId,
          provider: data.provider,
          connectionId: connectionId,
          organizationId: account.organizationId,
          accountType: account.type ?? "depository",
          logoUrl: data.logoUrl,
          manualSync,
        }));

        // Only run the sync if there are bank accounts enabled
        // We don't want to delay the sync if it's a manual sync
        // but we do want to delay it if it's an background sync to avoid rate limiting
        if (bankAccounts.length > 0) {
          // @ts-expect-error - TODO: Fix types
          await triggerSequenceAndWait(bankAccounts, syncAccount, {
            tags: ctx.run.tags,
            delayMinutes: manualSync ? 0 : 1,
          });
        }

        logger.info("Synced bank accounts completed");

        // Trigger a notification for new transactions if it's an background sync
        // We delay it by 1 minutes to allow for more transactions to be notified
        // if (!manualSync) {
        //   await transactionNotifications.trigger(
        //     { teamId: data.team_id },
        //     { delay: "1m" },
        //   );
        // }

        // Check connection status by accounts
        // If all accounts have 3+ error retries, disconnect the connection
        // So the user will get a notification and can reconnect the bank
        try {
          const bankAccountsData = await db
            .select({
              id: account_table.id,
              errorRetries: account_table.errorRetries,
            })
            .from(account_table)
            .where(
              and(
                eq(account_table.connectionId, connectionId),
                eq(account_table.manual, false),
                eq(account_table.enabled, true),
              ),
            );

          if (
            bankAccountsData?.every(
              (account) => (account.errorRetries ?? 0) >= 3,
            )
          ) {
            logger.info(
              "All bank accounts have 3+ error retries, disconnecting connection",
            );

            await db
              .update(connection_table)
              .set({ status: "disconnected" })
              .where(eq(connection_table.id, connectionId));
          }
        } catch (error) {
          logger.error("Failed to check connection status by accounts", {
            error,
          });
        }
      }

      if (connectionData.status === "disconnected") {
        logger.info("Connection disconnected");

        await db
          .update(connection_table)
          .set({ status: "disconnected" })
          .where(eq(connection_table.id, connectionId));
      }
    } catch (error) {
      logger.error("Failed to sync connection", { error });

      throw error;
    }
  },
});
