import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { account_table } from "~/server/db/schema/accounts";
import { connection_table } from "~/server/db/schema/open-banking";
import { getBankAccountProvider } from "~/server/integrations/open-banking";
import { reconnectConnectionSchema } from "~/shared/validators/bank-connection.schema";
import { and, eq } from "drizzle-orm";

import { syncConnection } from "./sync-connection";

export const reconnectConnection = schemaTask({
  id: "reconnect-connection",
  maxDuration: 120,
  retry: {
    maxAttempts: 2,
  },
  schema: reconnectConnectionSchema,
  run: async ({ orgId, connectionId, provider }) => {
    if (provider === "gocardless") {
      // We need to update the reference of the connection
      const [connection] = await db
        .select()
        .from(connection_table)
        .where(
          and(
            eq(connection_table.id, connectionId),
            eq(connection_table.organizationId, orgId),
          ),
        );

      if (!connection) {
        throw new Error("Connection not found");
      }

      const referenceId = connection.id;

      // Update the reference_id of the new connection
      if (referenceId) {
        logger.info("Updating reference_id of the new connection");

        await db
          .update(connection_table)
          .set({
            referenceId: referenceId,
          })
          .where(eq(connection_table.referenceId, referenceId));
      }

      // The account_ids can be different between the old and new connection
      // So we need to check for account_reference and update
      const provider = getBankAccountProvider("gocardless");
      const accounts = await provider.getAccounts({ id: referenceId });

      if (!accounts) {
        throw new Error("Accounts not found");
      }

      await Promise.all(
        accounts.map(async (account) => {
          await db
            .update(account_table)
            .set({
              externalId: account.externalId,
            })
            .where(
              eq(account_table.accountReference, account.accountReference!),
            );
        }),
      );
    }

    await syncConnection.trigger({
      connectionId,
      manualSync: true,
    });
  },
});
