import { and, eq } from "drizzle-orm";

import type { DBClient } from "../db";
import {
  transaction_attachment_table,
  transaction_table,
} from "../db/schema/transactions";

export type Attachment = {
  type: string;
  name: string;
  size: number;
  path: string[];
  transactionId?: string;
};

type CreateAttachmentsParams = {
  attachments: Attachment[];
  organizationId: string;
};

export async function createAttachments(
  db: DBClient,
  params: CreateAttachmentsParams,
) {
  const { attachments, organizationId } = params;

  const result = await db
    .insert(transaction_attachment_table)
    .values(
      attachments.map((attachment) => ({
        ...attachment,
        organizationId,
      })),
    )
    .returning();

  return result;
}

type DeleteAttachmentParams = {
  id: string;
  organizationId: string;
};

type GetTransactionAttachmentParams = {
  transactionId: string;
  attachmentId: string;
  organizationId: string;
};

export async function getTransactionAttachment(
  db: DBClient,
  params: GetTransactionAttachmentParams,
) {
  const { transactionId, attachmentId, organizationId } = params;

  const [result] = await db
    .select({
      id: transaction_attachment_table.id,
      name: transaction_attachment_table.name,
      path: transaction_attachment_table.path,
      type: transaction_attachment_table.type,
      size: transaction_attachment_table.size,
      transactionId: transaction_attachment_table.transactionId,
      organizationId: transaction_attachment_table.organizationId,
    })
    .from(transaction_attachment_table)
    .innerJoin(
      transaction_table,
      eq(transaction_attachment_table.transactionId, transaction_table.id),
    )
    .where(
      and(
        eq(transaction_attachment_table.id, attachmentId),
        eq(transaction_attachment_table.transactionId, transactionId),
        eq(transaction_attachment_table.organizationId, organizationId),
        eq(transaction_table.organizationId, organizationId),
      ),
    );

  return result;
}

export async function deleteAttachment(
  db: DBClient,
  params: DeleteAttachmentParams,
) {
  // First get the attachment to delete
  const [result] = await db
    .select({
      id: transaction_attachment_table.id,
      transactionId: transaction_attachment_table.transactionId,
      name: transaction_attachment_table.name,
      organizationId: transaction_attachment_table.organizationId,
    })
    .from(transaction_attachment_table)
    .where(
      and(
        eq(transaction_attachment_table.id, params.id),
        eq(transaction_attachment_table.organizationId, params.organizationId),
      ),
    );

  if (!result) {
    throw new Error("Attachment not found");
  }

  // Delete the attachment
  return db
    .delete(transaction_attachment_table)
    .where(
      and(
        eq(transaction_attachment_table.id, params.id),
        eq(transaction_attachment_table.organizationId, params.organizationId),
      ),
    );
}
