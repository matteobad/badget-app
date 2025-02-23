import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { TagInsertSchema } from "~/lib/validators";
import { transaction_table } from "~/server/db/schema/transactions";

// Document Schema
export const CSV_SCHEMA = z
  .instanceof(File)
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  });

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = z.input<typeof TransactionInsertSchema>;

export const TransactionInsertSchema = createInsertSchema(transaction_table, {
  date: z.coerce.date(),
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
    tags: z.array(TagInsertSchema).default([]),
  });

export type TransactionInsertSchema = z.infer<typeof TransactionInsertSchema>;

export const TransactionUpdateSchema = createInsertSchema(transaction_table, {
  id: z.string(),
  date: z.coerce.date().optional(),
  amount: z.coerce.string().optional(),
  note: z.string().optional(),
})
  .omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
    tags: z.array(TagInsertSchema).default([]),
  });

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

export const CategorizeTransactionSchema = z.object({
  description: z.string(),
});

export const AttachmentDeleteSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
});
export type AttachmentDeleteSchema = z.infer<typeof AttachmentDeleteSchema>;
