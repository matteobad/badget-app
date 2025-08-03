"server-only";

import type { DBClient, TXType } from "~/server/db";
import type { updateAttachmentSchema } from "~/shared/validators/attachment.schema";
import type z from "zod/v4";
import { attachment_table } from "~/server/db/schema/transactions";
import { and, eq } from "drizzle-orm";

export async function updateAttachmentMutation(
  tx: TXType,
  input: z.infer<typeof updateAttachmentSchema>,
  orgId: string,
) {
  if (!input.id || !input.transactionId) throw new Error("invalid attachment");

  return tx
    .update(attachment_table)
    .set(input)
    .where(
      and(
        eq(attachment_table.id, input.id),
        eq(attachment_table.organizationId, orgId),
      ),
    );
}

export async function deleteAttachmentMutation(
  tx: DBClient,
  id: string,
  orgId: string,
) {
  return tx
    .delete(attachment_table)
    .where(
      and(
        eq(attachment_table.id, id),
        eq(attachment_table.organizationId, orgId),
      ),
    );
}
