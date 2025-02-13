import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { transaction_table } from "~/server/db/schema/transactions";

export const TransactionInsertSchema = createInsertSchema(transaction_table, {
  amount: z.coerce.string(),
  note: z.string().optional(),
})
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
  });

export type TransactionInsertSchema = z.infer<typeof TransactionInsertSchema>;

export const TransactionImportSchema = z.object({
  file: z.instanceof(File).refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  }),
  fieldMapping: z.object({
    date: z.string({ message: "Missing date mapping" }),
    description: z.string({ message: "Missing description mapping" }),
    amount: z.string({ message: "Missing amount mapping" }),
    currency: z.string().default("EUR"),
  }),
  extraFields: z.object({ accountId: z.string() }),
  settings: z.object({ inverted: z.boolean().default(false) }),
});
export type TransactionImportSchema = z.infer<typeof TransactionImportSchema>;

export const TransactionDeleteSchema = z.object({
  ids: z.array(z.string()),
});
export type TransactionDeleteSchema = z.infer<typeof TransactionDeleteSchema>;

export const AttachmentDeleteSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
});
export type AttachmentDeleteSchema = z.infer<typeof AttachmentDeleteSchema>;
