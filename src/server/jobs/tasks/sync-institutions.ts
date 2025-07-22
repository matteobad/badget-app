import { logger, schedules } from "@trigger.dev/sdk/v3";
import { getBankAccountProvider } from "~/features/account/server/providers";
import { db } from "~/server/db";
import { institution_table } from "~/server/db/schema/open-banking";
import { buildConflictUpdateColumns } from "~/server/db/utils";

// Fan-out pattern. We want to trigger a task for each bank account (Transactions, Balance)
export const syncInstitutions = schedules.task({
  id: "sync-institutions",
  cron: {
    // 5am every day Tokyo time
    pattern: "0 5 * * *",
    timezone: "Asia/Tokyo",
  },
  retry: {
    maxAttempts: 2,
  },
  run: async () => {
    try {
      const provider = getBankAccountProvider("gocardless");
      const data = await provider.getInstitutions({
        countryCode: "IT",
      });

      if (data.length === 0) {
        logger.error("Institutions not found");
        throw new Error("Institutions not found");
      }

      await db
        .insert(institution_table)
        .values(data)
        .onConflictDoUpdate({
          target: [institution_table.originalId],
          set: buildConflictUpdateColumns(institution_table, [
            "countries",
            "logo",
          ]),
        })
        .returning();

      logger.info("Synced institutions completed");
    } catch (error) {
      logger.error("Failed to sync institutions", { error });

      throw error;
    }
  },
});
