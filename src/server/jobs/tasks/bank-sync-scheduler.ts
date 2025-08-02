import { logger, schedules } from "@trigger.dev/sdk/v3";
import { db } from "~/server/db";
import { connection_table } from "~/server/db/schema/open-banking";
import { eq } from "drizzle-orm";

import { syncConnection } from "./sync-connection";

// This is a fan-out pattern. We want to trigger a job for each bank connection
// Then in sync connection we check if the connection is connected and if not we update the status (Connected, Disconnected)
export const bankSyncScheduler = schedules.task({
  id: "bank-sync-scheduler",
  maxDuration: 120,
  run: async (payload) => {
    // Only run in production (Set in Trigger.dev)
    if (process.env.TRIGGER_ENVIRONMENT !== "production") return;

    const orgId = payload.externalId;

    if (!orgId) {
      throw new Error("orgId is required");
    }

    try {
      const bankConnections = await db
        .select()
        .from(connection_table)
        .where(eq(connection_table.organizationId, orgId));

      const formattedConnections = bankConnections?.map((connection) => ({
        payload: {
          connectionId: connection.id,
        },
        tags: ["organization_id", orgId],
      }));

      // If there are no bank connections to sync, return
      if (!formattedConnections?.length) {
        logger.info("No bank connections to sync");
        return;
      }

      await syncConnection.batchTrigger(formattedConnections);
    } catch (error) {
      logger.error("Failed to sync bank connections", { error });

      throw error;
    }
  },
});
