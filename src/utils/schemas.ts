import { z } from "zod";

import { type TransactionInsertSchema } from "~/lib/validators";

// Document Schema
export const CSV_SCHEMA = z
  .instanceof(File)
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  });

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = z.input<typeof TransactionInsertSchema>;
