import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { transaction_table } from "~/server/db/schema/transactions";

// Document Schema
export const CSV_SCHEMA = z
  .instanceof(File)
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  });

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = Partial<DB_TransactionInsertType>;

export const TransactionInsertSchema = createInsertSchema(transaction_table, {
  date: z.coerce.date(),
  amount: z.coerce.string(),
  note: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type TransactionInsertType = z.input<typeof TransactionInsertSchema>;

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
