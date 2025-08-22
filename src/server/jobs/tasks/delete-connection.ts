import { schemaTask } from "@trigger.dev/sdk";
import { db } from "~/server/db";
import { connection_table } from "~/server/db/schema/open-banking";
import { deleteConnectionSchema } from "~/shared/validators/tasks.schema";
import { and, eq } from "drizzle-orm";

export const deleteConnection = schemaTask({
  id: "delete-connection",
  schema: deleteConnectionSchema,
  maxDuration: 60,
  queue: {
    concurrencyLimit: 5,
  },
  run: async (payload) => {
    const { referenceId, provider } = payload;

    await db
      .delete(connection_table)
      .where(
        and(
          eq(connection_table.id, referenceId),
          eq(connection_table.provider, provider),
        ),
      );
  },
});
