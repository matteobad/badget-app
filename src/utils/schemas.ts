import { z } from "zod";

// Status schema for progress updates
export const CSVStatus = z.enum([
  "fetching",
  "parsing",
  "processing",
  "complete",
]);

export type CSVStatus = z.infer<typeof CSVStatus>;

export const CSVBatchStatus = z.object({
  status: z.enum(["queued", "processing", "complete"]),
  count: z.number().int().nonnegative(),
  processed: z.number().int().nonnegative(),
  valid: z.number().int().nonnegative(),
  invalid: z.number().int().nonnegative(),
});

export type CSVBatchStatus = z.infer<typeof CSVBatchStatus>;

// The full metadata schema that encompasses all possible metadata fields
export const CSVUploadMetadataSchema = z.object({
  status: CSVStatus,
  batches: z.array(CSVBatchStatus).default([]),
  totalApiCalls: z.number().int().nonnegative().default(0),
  totalRows: z.number().int().nonnegative().default(0),
  totalProcessed: z.number().int().nonnegative().default(0),
  totalValid: z.number().int().nonnegative().default(0),
  totalInvalid: z.number().int().nonnegative().default(0),
});

export type CSVUploadMetadata = z.infer<typeof CSVUploadMetadataSchema>;

export const CSVMappingSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.string(),
});

export type CSVMapping = z.infer<typeof CSVMappingSchema>;

// Document Schema
export const CSV_SCHEMA = z
  .instanceof(File)
  .refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  });
