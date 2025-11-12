import { z } from "@hono/zod-openapi";
import { createSelectSchema } from "drizzle-zod";
import type { DB_TransactionInsertType } from "~/server/db/schema/transactions";
import { transaction_table } from "~/server/db/schema/transactions";
import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_SOURCE,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";

export const selectTransactionSchema = createSelectSchema(transaction_table);

export const createTransactionSchema = z.object({
  amount: z.number().refine((val) => Math.abs(val) > 0, {
    message: "Amount must be greater than 0",
  }),
  currency: z.string(),
  date: z.iso.date(),
  name: z.string().min(1),
  description: z.string(),
  counterparty: z.string().optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  source: z.enum(TRANSACTION_SOURCE),
  method: z.enum(TRANSACTION_METHOD),
  frequency: z.enum(TRANSACTION_FREQUENCY).optional(),
  internal: z.boolean().optional(),
  note: z.string().optional(),
  bankAccountId: z.uuid(),
  transferId: z.uuid().optional(),
  categorySlug: z.string().optional(),
  attachments: z
    .array(
      z.object({
        path: z.array(z.string()),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      }),
    )
    .optional(),
  tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  transactionType: z.enum(["income", "expense"]),
});

export const updateTransactionSchema = z.object({
  id: z.uuid().openapi({
    description: "Transaction ID (UUID).",
    param: {
      in: "path",
      name: "id",
    },
  }),
  status: z.enum(TRANSACTION_STATUS).optional().openapi({
    description: "Status of the transaction.",
  }),
  categorySlug: z.string().optional().openapi({
    description: "Category slug for the transaction.",
  }),
  method: z.enum(TRANSACTION_METHOD).optional(),
  note: z.string().optional().openapi({
    description: "Note for the transaction.",
  }),
  frequency: z.enum(TRANSACTION_FREQUENCY).optional().openapi({
    description: "Recurring frequency of the transaction.",
  }),
  recurring: z.boolean().optional().openapi({
    description: "Whether the transaction is recurring.",
  }),
  internal: z.boolean().optional().openapi({
    description: "Whether the transaction is internal.",
  }),
  name: z.string().optional().openapi({
    description: "Name/description of the transaction.",
  }),
  amount: z.number().optional().openapi({
    description: "Amount of the transaction.",
  }),
  currency: z.string().optional().openapi({
    description: "Currency of the transaction.",
  }),
  date: z.iso.date().optional().openapi({
    description: "Date of the transaction (ISO 8601).",
  }),
  bankAccountId: z.string().optional().openapi({
    description: "Bank account ID associated with the transaction.",
  }),
});

export const deleteTransactionSchema = z.object({
  id: z.uuid(),
});

export const getSimilarTransactionsSchema = z.object({
  name: z.string().openapi({
    description: "Name of the transaction.",
    param: {
      in: "query",
    },
  }),
  categorySlug: z
    .string()
    .optional()
    .openapi({
      description: "Category slug to filter similar transactions.",
      param: {
        in: "query",
      },
    }),
  frequency: z
    .enum(TRANSACTION_FREQUENCY)
    .optional()
    .openapi({
      description: "Recurring frequency to filter similar transactions.",
      param: {
        in: "query",
      },
    }),
  transactionId: z.uuid().optional().openapi({
    description: "Transaction ID to exclude from results.",
  }),
  minSimilarityScore: z
    .number()
    .min(0.1)
    .max(1.0)
    .optional()
    .default(0.8)
    .openapi({
      description:
        "Minimum similarity score (0.1-1.0) for transactions to be considered similar.",
      param: {
        in: "query",
      },
    }),
});

export const updateTransactionsSchema = z.object({
  ids: z.array(z.string()).openapi({
    description: "Array of transaction IDs to update.",
  }),
  categoryId: z.string().nullable().optional().openapi({
    description: "Category id for the transactions.",
  }),
  categorySlug: z.string().nullable().optional().openapi({
    description: "Category slug for the transactions.",
  }),
  status: z.enum(TRANSACTION_STATUS).optional().openapi({
    description: "Status to set for the transactions.",
  }),
  frequency: z.enum(TRANSACTION_FREQUENCY).nullable().optional().openapi({
    description: "Recurring frequency to set for the transactions.",
  }),
  internal: z.boolean().optional().openapi({
    description: "Whether the transactions are internal.",
  }),
  note: z.string().nullable().optional().openapi({
    description: "Note to set for the transactions.",
  }),
  assignedId: z.string().nullable().optional().openapi({
    description: "Assigned user ID for the transactions.",
  }),
  recurring: z.boolean().optional().openapi({
    description: "Whether the transactions are recurring.",
  }),
  tagId: z.string().nullable().optional().openapi({
    description: "Tag ID to set for the transactions.",
  }),
});

export const updateTransactionTagsSchema = z.object({
  transactionId: z.cuid2(),
  tags: z.array(z.string()),
});

export const deleteManyTransactionsSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export const categorizeTransactionSchema = z.object({
  id: z.cuid2(),
});

export const parseTransactionCSVSchema = z.object({
  file: z.file().mime(["text/csv"]),
  maxRows: z.number().default(9999),
});

export const importTransactionSchema = z.object({
  filePath: z.array(z.string()).optional(),
  bankAccountId: z.string(),
  currency: z.string(),
  inverted: z.boolean(),
  mappings: z.object({
    amount: z.string(),
    date: z.string(),
    description: z.string(),
    balance: z.string().optional(),
  }),
});

export const exportTransactionsSchema = z.object({
  transactionIds: z.array(z.string()),
  dateFormat: z.string().optional(),
  locale: z.string().optional().default("en"),
  exportSettings: z
    .object({
      csvDelimiter: z.string(),
      includeCSV: z.boolean(),
      includeXLSX: z.boolean(),
      sendEmail: z.boolean(),
      accountantEmail: z.string().optional(),
    })
    .optional(),
});

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = DB_TransactionInsertType;

// Query filter schema
export const getTransactionsSchema = z.object({
  // pagination
  cursor: z.string().nullable().optional(),
  sort: z.array(z.string()).min(2).max(2).nullable().optional(),
  pageSize: z.coerce.number().min(1).max(10000).optional(),
  // filters
  q: z.string().nullable().optional(),
  categories: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  accounts: z.array(z.string()).nullable().optional(),
  type: z.enum(["income", "expense"]).nullable().optional(),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  recurring: z.array(z.string()).nullable().optional(),
  amountRange: z.array(z.coerce.number()).nullable().optional(),
  amount: z.array(z.string()).nullable().optional(),
  manual: z.enum(["include", "exclude"]).nullable().optional(),
  reporting: z.enum(["include", "exclude"]).nullable().optional(),
});

export const getTransactionByIdSchema = z.object({
  id: z.uuid(),
});

export const generateTransactionFiltersSchema = z.object({
  name: z.string().optional().describe("The name to search for"),
  start: z.iso
    .date()
    .optional()
    .describe("The start date when to retrieve from. Return ISO-8601 format."),
  end: z.iso
    .date()
    .optional()
    .describe(
      "The end date when to retrieve data from. If not provided, defaults to the current date. Return ISO-8601 format.",
    ),
  categories: z
    .array(z.string())
    .optional()
    .describe("The categories to filter by"),
  tags: z.array(z.string()).optional().describe("The tags to filter by"),
  recurring: z
    .array(z.enum(["all", "weekly", "monthly", "annually"]))
    .optional()
    .describe("The recurring to filter by"),
  amountRange: z
    .array(z.number())
    .optional()
    .describe("The amount range to filter by"),
});
