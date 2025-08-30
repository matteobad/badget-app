import type {
  DB_TransactionInsertType,
  DB_TransactionType,
} from "~/server/db/schema/transactions";
import { getSortingStateParser } from "~/lib/validators";
import { transaction_table } from "~/server/db/schema/transactions";
import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_METHOD,
  TRANSACTION_SOURCE,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
} from "nuqs/server";
import z from "zod/v4";

export const selectTransactionSchema = createSelectSchema(transaction_table);

export const createTransactionSchema = createInsertSchema(transaction_table, {
  note: z.string().optional(),
  method: z.enum(TRANSACTION_METHOD),
  status: z.enum(TRANSACTION_STATUS),
  frequency: z.enum(TRANSACTION_FREQUENCY).optional(),
  source: z.enum(TRANSACTION_SOURCE).optional(),
})
  .extend({
    attachment_ids: z.array(z.string()).optional(),
    tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    organizationId: true,
  });

export const createManualTransactionSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  date: z.iso.date(),
  name: z.string().min(1),
  description: z.string(),
  counterparty: z.string().optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  source: z.enum(TRANSACTION_SOURCE).optional(),
  method: z.enum(TRANSACTION_METHOD).optional(),
  frequency: z.enum(TRANSACTION_FREQUENCY).optional(),
  internal: z.boolean().optional(),
  note: z.string().optional(),
  accountId: z.uuid(),
  transferId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  attachment_ids: z.array(z.string()).optional(),
  tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
});

export const createTransferSchema = z.object({
  fromAccountId: z.uuid(),
  toAccountId: z.uuid(),
  amount: z.number(),
  date: z.iso.date(),
  description: z.string().min(1),
});

export const updateTransactionSchema = z.object({
  id: z.uuid(),
  amount: z.number().optional(),
  date: z.iso.date().optional(),
  description: z.string().optional(),
  counterparty: z.string().optional(),
  status: z.enum(TRANSACTION_STATUS).optional(),
  categoryId: z.uuid().optional(),
  categorySlug: z.string().optional(),
  method: z.enum(TRANSACTION_METHOD).optional(),
  note: z.string().optional(),
  frequency: z.enum(TRANSACTION_FREQUENCY).optional(),
  recurring: z.boolean().optional(),
  internal: z.boolean().optional(),
});

export const deleteTransactionSchema = z.object({
  id: z.uuid(),
});

export const deleteTranferSchema = z.object({
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
    .enum(["weekly", "monthly", "annually", "irregular"])
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

export const updateManyTransactionsSchema = z.object({
  ids: z.array(z.string().min(1)),
  categoryId: z.string().nullable().optional(),
  tagId: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  // recurring?: boolean;
  // frequency?: "weekly" | "monthly" | "annually" | "irregular" | null;
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
  file: z.file().mime(["text/csv"]),
  fieldMapping: z.object({
    date: z.string({ message: "Missing date mapping" }),
    description: z.string({ message: "Missing description mapping" }),
    amount: z.string({ message: "Missing amount mapping" }),
    currency: z.string(),
  }),
  extraFields: z.object({ accountId: z.string() }),
  settings: z.object({ inverted: z.boolean() }),
});

export type CSVRow = Record<string, string | null>;
export type CSVRowParsed = DB_TransactionInsertType;

// Query filter schema
export const getTransactionsSchema = z.object({
  cursor: z.string().nullable().optional(),
  sort: z.array(z.string()).min(2).max(2).nullable().optional(),
  pageSize: z.coerce.number().min(1).max(10000).optional(),

  q: z.string().nullable().optional(),
  categories: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  start: z.string().nullable().optional(),
  end: z.string().nullable().optional(),
  accounts: z.array(z.string()).nullable().optional(),
  statuses: z.array(z.string()).nullable().optional(),
  recurring: z.array(z.string()).nullable().optional(),
  attachments: z.enum(["include", "exclude"]).nullable().optional(),
  amount_range: z.array(z.coerce.number()).nullable().optional(),
  amount: z.array(z.string()).nullable().optional(),
  type: z.enum(["income", "expense"]).nullable().optional(),
});

// Search params filter schema
export const transactionFilterParamsSchema = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DB_TransactionType>().withDefault([
    { id: "date", desc: true },
  ]),
  date: parseAsArrayOf(parseAsString).withDefault([]),
  description: parseAsString.withDefault(""),
  amount_range: parseAsArrayOf(parseAsInteger).withDefault([]),
  amount: parseAsArrayOf(parseAsString).withDefault([]),
  categoryId: parseAsArrayOf(parseAsString).withDefault([]),
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  accountId: parseAsArrayOf(parseAsString).withDefault([]),
};

// Search params for sheets
export const transactionParamsSchema = {
  transactionId: parseAsString,
  createTransaction: parseAsBoolean,
  importTransaction: parseAsBoolean,
};
