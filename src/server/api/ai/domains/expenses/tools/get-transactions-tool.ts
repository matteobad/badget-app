// import { cached } from "@ai-sdk-tools/cache";
import { getTransactions } from "~/server/services/transaction-service";
import {
  TRANSACTION_FREQUENCY,
  TRANSACTION_STATUS,
} from "~/shared/constants/enum";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../../context";

export const getTransactionsSchema = z.object({
  cursor: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Cursor for pagination, representing the last item from the previous page",
    ),
  sort: z
    .array(z.string().min(1))
    .max(2)
    .min(2)
    .nullable()
    .optional()
    .describe(
      "Sorting order as a tuple: [field, direction]. Example: ['date', 'desc'] or ['amount', 'asc']",
    ),
  pageSize: z
    .number()
    .min(1)
    .max(25)
    .default(10)
    .describe("Number of transactions to return per page (1-25)"),
  q: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Search query string to filter transactions by name, description, or other text fields",
    ),
  statuses: z
    .array(z.enum(TRANSACTION_STATUS))
    .nullable()
    .optional()
    .describe(
      "Array of transaction statuses to filter by. Available statuses: 'posted', 'pending', 'excluded', 'completed', 'archived'",
    ),
  attachments: z
    .enum(["include", "exclude"])
    .nullable()
    .optional()
    .describe(
      "Filter transactions based on attachment presence. 'include' returns only transactions with attachments, 'exclude' returns only transactions without attachments",
    ),
  categories: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Array of category slugs to filter transactions by specific categories.",
    ),
  tags: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Array of tag IDs to filter transactions by specific tags"),
  accounts: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Array of bank account IDs to filter transactions by specific accounts",
    ),
  type: z
    .enum(["income", "expense"])
    .nullable()
    .optional()
    .describe(
      "Transaction type to filter by. 'income' for money received, 'expense' for money spent",
    ),
  start: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Start date (inclusive) for filtering transactions in ISO 8601 format",
    ),
  end: z
    .string()
    .nullable()
    .optional()
    .describe(
      "End date (inclusive) for filtering transactions in ISO 8601 format",
    ),
  recurring: z
    .array(z.enum(TRANSACTION_FREQUENCY))
    .nullable()
    .optional()
    .describe(
      "Array of recurring frequency values to filter by. Available frequencies: 'weekly', 'biweekly', 'monthly', 'semi_monthly', 'annually', 'irregular', 'all'",
    ),
  amountRange: z
    .array(z.number().nullable())
    .length(2)
    .nullable()
    .optional()
    .describe(
      "Amount range as [min, max] to filter transactions by monetary value",
    ),
  amount: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Array of specific amounts (as strings) to filter transactions by exact values",
    ),
  currency: z
    .string()
    .nullable()
    .optional()
    .describe("Currency code to filter transactions by specific currency"),
});

export const getTransactionsTool = tool({
  description:
    "Query the transaction table to retrieve financial transactions based on various filters such as date, amount, account, category, status, and more. Use this tool to search, filter, and analyze transaction records for reporting or user inquiries.",
  inputSchema: getTransactionsSchema,
  execute: async function (input) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        organizationId: context.user.organizationId,
        cursor: input?.cursor ?? null,
        sort: input?.sort ?? null,
        pageSize: input?.pageSize ?? 10,
        q: input?.q ?? null,
        statuses: input?.statuses ?? null,
        attachments: input?.attachments ?? null,
        categories: input?.categories ?? null,
        tags: input?.tags ?? null,
        accounts: input?.accounts ?? null,
        type: input?.type ?? null,
        start: input?.start ?? null,
        end: input?.end ?? null,
        recurring: input?.recurring ?? null,
        amount_range:
          input?.amountRange?.filter((val): val is number => val !== null) ??
          null,
        amount: input?.amount ?? null,
        currency: input?.currency ?? null,
      };

      // Get transactions from database
      const result = await getTransactions(params, context.user.organizationId);

      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});

// First call: 2s API request
// Next calls: <1ms from cache ⚡

// Works with streaming tools + artifacts
// const burnRateAnalysis = cached(getTransactionsTool, {
//   ttl: 10 * 60 * 1000, // 10 minutes
//   onHit: (key) => console.log(`Cache hit for ${key}`),
//   onMiss: (key) => console.log(`Cache miss for ${key}`),
// });
// Caches complete data: yields + charts + metrics
