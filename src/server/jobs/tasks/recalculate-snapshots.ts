import { logger, schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import {
  adjustBalanceOffsets,
  recalculateSnapshots,
} from "~/server/services/balance-snapshots-service";
import { z } from "zod/v4";

/**
 * Task to recalculate daily balance snapshots for a bank account.
 */
export const recalculateSnapshotsTask = schemaTask({
  id: "recalculate-snapshots",
  maxDuration: 120,
  queue: {
    concurrencyLimit: 5,
  },
  schema: z.object({
    accountId: z.uuid(),
    fromDate: z.date(),
    organizationId: z.string(),
  }),
  run: async ({ accountId, fromDate, organizationId }) => {
    try {
      // Adjust balance offsets for manual accounts
      await adjustBalanceOffsets(db, { accountId, fromDate }, organizationId);
      // Recalculate snapshots from the affected date
      await recalculateSnapshots(db, { accountId, fromDate }, organizationId);
    } catch (error) {
      logger.error("Failed to recalculate snapshots balances", { error });
      throw error;
    }
  },
});
