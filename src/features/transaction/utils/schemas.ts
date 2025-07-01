import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { TagInsertSchema } from "~/lib/validators";
import { transaction_table } from "~/server/db/schema/transactions";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const TransactionUpdateSchema = createInsertSchema(transaction_table, {
  id: z.string(),
  date: z.date().optional(),
  amount: z.string().optional(),
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

export const TransactionUpdateBulkSchema = z.object({
  ids: z.array(z.string()),
  categoryId: z.string().optional(),
});

export const TransactionDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const CSV_SCHEMA = z
  .instanceof(File)
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  });

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = Partial<DB_TransactionInsertType>;

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

export const CategorizeTransactionSchema = z.object({
  description: z.string(),
});

export const AttachmentDeleteSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
});
