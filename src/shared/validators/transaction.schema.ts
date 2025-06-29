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

export const createTransactionSchema = createInsertSchema(
  transaction_table,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTransactionSchema = createUpdateSchema(transaction_table, {
  id: z.string().min(1), // TODO: change to cuid2
}).omit({
  createdAt: true,
  updatedAt: true,
});

export const deleteTransactionSchema = z.object({
  id: z.string().min(1), // TODO: change to cuid2
});

// Query filter schema
export const getTransactionsSchema = z.object({
  cursor: z.string().nullable().optional(),
  sort: z.array(z.string(), z.string()).nullable().optional(),
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
  amountRange: z.array(z.coerce.number()).nullable().optional(),
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
