"server-only";

import type { DBClient } from "~/server/db";
import { db } from "~/server/db";
import { attachment_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export const deleteTransactionAttachment = (
  id: string,
  orgId: string,
  client: DBClient = db,
) => {
  return client
    .delete(attachment_table)
    .where(
      and(
        eq(attachment_table.id, id),
        eq(attachment_table.organizationId, orgId),
      ),
    );
};
