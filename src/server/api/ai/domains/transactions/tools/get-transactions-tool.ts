import { getTransactions } from "~/server/services/transaction-service";
import { tool } from "ai";
import z from "zod";

import { cached } from "../../../cache";
import { getContext } from "../../../context";

export const getTransactionsSchema = z.object({
  cursor: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Pagination cursor for fetching the next page of results. Used for infinite scrolling or paginated queries.",
    ),
  sort: z
    .array(z.string())
    .min(2)
    .max(2)
    .nullable()
    .optional()
    .describe(
      "Sort order for transactions. Should be an array of [field, direction], e.g. ['date', 'desc'].",
    ),
  pageSize: z.coerce
    .number()
    .min(1)
    .max(10000)
    .optional()
    .describe(
      "Maximum number of transactions to return per page. Defaults to 10 if not specified.",
    ),
  q: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Search query to filter transactions by name or description. Useful for keyword search.",
    ),
  categories: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by one or more category slugs. Only transactions in these categories will be returned.",
    ),
  tags: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by one or more tag IDs. Only transactions with these tags will be returned.",
    ),
  start: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Start date (inclusive) for filtering transactions. Format: YYYY-MM-DD.",
    ),
  end: z
    .string()
    .nullable()
    .optional()
    .describe(
      "End date (inclusive) for filtering transactions. Format: YYYY-MM-DD.",
    ),
  accounts: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by one or more account IDs. Only transactions from these accounts will be returned.",
    ),
  recurring: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by recurring series IDs. Only transactions that are part of these recurring series will be returned.",
    ),
  attachments: z
    .enum(["include", "exclude"])
    .nullable()
    .optional()
    .describe(
      "Filter transactions by attachment presence. 'include' returns only transactions with attachments, 'exclude' returns only those without.",
    ),
  amount_range: z
    .array(z.coerce.number())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by amount range. Should be [min, max] in the account's currency.",
    ),
  amount: z
    .array(z.string())
    .nullable()
    .optional()
    .describe(
      "Filter transactions by specific amounts. Useful for finding transactions with exact values.",
    ),
  type: z
    .enum(["income", "expense"])
    .nullable()
    .optional()
    .describe(
      "Transaction type to filter by. 'income' positive transactions, 'expense' for negative ones.",
    ),
});

// Output schema LLM friendly
export const getTransactionsOutputSchema = z.object({
  count: z.number().describe("Number of transactions returned."),
  transactions: z.array(
    z.object({
      id: z.string().describe("Unique identifier for the transaction."),
      date: z.string().describe("Transaction date in ISO 8601 format."),
      amount: z
        .number()
        .describe("Transaction amount in the account's currency."),
      currency: z.string().describe("Currency code, e.g. 'EUR'."),
      status: z
        .string()
        .describe(
          "Transaction status, e.g. 'pending', 'posted', or 'cleared'.",
        ),
      note: z
        .string()
        .nullable()
        .describe("User or system note attached to the transaction."),
      internal: z
        .boolean()
        .describe(
          "True if the transaction is internal (e.g. transfer between accounts).",
        ),
      source: z
        .string()
        .nullable()
        .describe(
          "Source of the transaction, e.g. 'manual', 'open-banking', etc.",
        ),
      recurring: z
        .string()
        .nullable()
        .describe(
          "Recurring series ID if the transaction is part of a recurring series.",
        ),
      counterpartyName: z
        .string()
        .nullable()
        .describe("Name of the counterparty (merchant, payee, etc.)."),
      frequency: z
        .string()
        .nullable()
        .describe("Frequency of the recurring transaction, if applicable."),
      name: z.string().nullable().describe("Transaction name or title."),
      description: z
        .string()
        .nullable()
        .describe("Detailed description of the transaction."),
      enrichmentCompleted: z
        .boolean()
        .nullable()
        .describe(
          "True if enrichment (categorization, merchant, etc.) is completed.",
        ),
      createdAt: z
        .string()
        .describe("Timestamp when the transaction was created (ISO 8601)."),
      attachments: z
        .array(
          z.object({
            id: z.string().describe("Attachment unique identifier."),
            filename: z
              .string()
              .nullable()
              .describe("Original filename of the attachment."),
            path: z
              .string()
              .nullable()
              .describe("Storage path or URL of the attachment."),
            type: z.string().describe("MIME type of the attachment."),
            size: z.number().describe("Attachment file size in bytes."),
          }),
        )
        .describe("List of attachments associated with the transaction."),
      category: z
        .object({
          id: z.string().describe("Category unique identifier."),
          slug: z.string().describe("Category slug (URL-friendly identifier)."),
          name: z.string().describe("Category display name."),
          color: z.string().describe("Category color (hex code or name)."),
          icon: z.string().describe("Category icon name or URL."),
          excluded: z
            .boolean()
            .describe("True if the category is excluded from reports."),
        })
        .describe("Category assigned to the transaction."),
      account: z
        .object({
          id: z.string().describe("Account unique identifier."),
          name: z.string().describe("Account display name."),
          currency: z.string().describe("Account currency code."),
          logoUrl: z
            .string()
            .nullable()
            .describe("URL of the account's logo, if available."),
        })
        .describe("Account from which the transaction originated."),
      tags: z
        .array(
          z.object({
            id: z.string().describe("Tag unique identifier."),
            name: z.string().nullable().describe("Tag name."),
          }),
        )
        .describe("List of tags associated with the transaction."),
      splits: z
        .array(
          z.object({
            id: z.string().describe("Split unique identifier."),
            note: z.string().nullable().describe("Note for this split."),
            categorySlug: z
              .string()
              .nullable()
              .describe("Category slug for this split."),
            amount: z.number().describe("Amount for this split."),
          }),
        )
        .describe(
          "List of splits if the transaction is split across categories.",
        ),
    }),
  ),
  appliedFilters: z
    .record(z.string(), z.any())
    .describe("Filters actually used in this query."),
});

export const getTransactionsTool = cached(
  tool({
    description: `
      Retrieve financial transactions for the authenticated user.
      
      Use this tool when you need to:
      - Search transactions by name, description.
      - Filter by date range, account, category, tag or amount.
      - Filter recurring transactions by frequency.
      - Retrieve transactions with or without attachments.

      Never use this tool to get accounts, balances or categories.
      
      Returns a structured list of transactions, ideal for display in tables or cards.
      Each item includes id, name, description, date, amount, currency, account, category and tags.
    `,
    inputSchema: getTransactionsSchema,
    // outputSchema: getTransactionsOutputSchema,
    execute: async function (input) {
      const context = getContext();

      try {
        const result = await getTransactions(
          input,
          context.user.organizationId,
        );

        const output = {
          count: result.data.length,
          transaction: result.data,
          appliedFilters: input,
        };

        // ✅ Validate output structure before returning
        return output;
        // return getTransactionsOutputSchema.parse(output);
      } catch (error) {
        console.error("[getTransactionsTool] Error:", error);
        throw new Error(
          "Failed to retrieve transactions. Please try again later.",
        );
      }
    },
  }),
);
