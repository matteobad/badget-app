import { attachment_table } from "~/server/db/schema/transactions";
import { createUpdateSchema } from "drizzle-zod";
import z from "zod/v4";

export const updateAttachmentSchema = createUpdateSchema(attachment_table, {
  id: z.cuid2(),
}).omit({
  createdAt: true,
  updatedAt: true,
});
