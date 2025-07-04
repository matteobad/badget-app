import type { DB_TransactionType } from "~/server/db/schema/transactions";
import { getSortingStateParser } from "~/lib/validators";
import { transaction_table } from "~/server/db/schema/transactions";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
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
})
  .extend({
    attachment_ids: z.array(z.string()).optional(),
    tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    userId: true,
  });

export const updateTransactionSchema = createUpdateSchema(transaction_table, {
  id: z.string().min(1),
  note: z.string().nullable().optional(),
})
  .extend({
    attachment_ids: z.array(z.string()).optional(),
    tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  })
  .omit({
    createdAt: true,
    updatedAt: true,
    userId: true,
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

export const deleteTransactionSchema = z.object({
  id: z.cuid2(),
});

export const deleteManyTransactionsSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export const categorizeTransactionSchema = z.object({
  id: z.cuid2(),
});

export const importTransactionSchema = z.object({
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
