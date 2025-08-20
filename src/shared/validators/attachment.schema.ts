import { attachment_table } from "~/server/db/schema/transactions";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod/v4";

export const createAttachmentSchema = createInsertSchema(attachment_table);

export const updateAttachmentSchema = createUpdateSchema(attachment_table).omit(
  {
    createdAt: true,
    updatedAt: true,
  },
);

export const attachmentDeleteSchema = z.object({
  id: z.uuid(),
  fileKey: z.string(),
});
