import { getTransactions } from "~/server/services/transaction-service";
import { formatAmount, formatDate } from "~/shared/helpers/format";
import { getUrl } from "~/shared/helpers/get-url";
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
    .array(z.enum(["pending", "completed", "archived", "posted", "excluded"]))
    .nullable()
    .optional()
    .describe(
      "Array of transaction statuses to filter by. Available statuses: 'pending', 'completed', 'archived', 'posted', 'excluded'",
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
      "Array of category slugs to filter transactions by specific categories",
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
    .array(z.enum(["weekly", "monthly", "annually", "irregular", "all"]))
    .nullable()
    .optional()
    .describe(
      "Array of recurring frequency values to filter by. Available frequencies: 'weekly', 'monthly', 'annually', 'irregular', 'all'",
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
    "Retrieve and analyze financial transactions with advanced filtering, search, and sorting capabilities. Use this tool when users ask about specific transactions, want to see recent activity, search for particular payments, or need transaction data for analysis.",
  inputSchema: getTransactionsSchema,
  execute: async function* ({
    cursor,
    sort,
    pageSize = 10,
    q,
    statuses,
    attachments,
    categories,
    tags,
    accounts,
    type,
    start,
    end,
    recurring,
    amountRange,
    amount,
    currency,
  }) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        organizationId: context.user.organizationId,
        cursor: cursor ?? null,
        sort: sort ?? null,
        pageSize,
        q: q ?? null,
        statuses: statuses ?? null,
        attachments: attachments ?? null,
        categories: categories ?? null,
        tags: tags ?? null,
        accounts: accounts ?? null,
        type: type ?? null,
        start: start ?? null,
        end: end ?? null,
        recurring: recurring ?? null,
        amount_range:
          amountRange?.filter((val): val is number => val !== null) ?? null,
        amount: amount ?? null,
      };

      // Get transactions from database
      const result = await getTransactions(params, context.user.organizationId);

      // Early return if no data
      if (result.data.length === 0) {
        yield { text: "No transactions found matching your criteria." };
      }

      // Get the target currency for display
      const targetCurrency = currency ?? context.user.baseCurrency ?? "EUR";

      // Format transactions for markdown display
      const formattedTransactions = result.data.map((transaction) => {
        const formattedAmount = formatAmount({
          amount: transaction.amount,
          currency: transaction.currency || targetCurrency,
          locale: context.user.locale ?? undefined,
        });

        return {
          id: transaction.id,
          name: transaction.name,
          amount: formattedAmount,
          date: formatDate(transaction.date),
          category: transaction.category?.name ?? "Uncategorized",
        };
      });

      // Calculate summary statistics
      const totalAmount = result.data.reduce((sum, t) => sum + t.amount, 0);

      const incomeAmount = result.data
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenseAmount = Math.abs(
        result.data
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0),
      );

      const formattedTotalAmount = formatAmount({
        amount: totalAmount,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const formattedIncomeAmount = formatAmount({
        amount: incomeAmount,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const formattedExpenseAmount = formatAmount({
        amount: expenseAmount,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      // Table format
      const response = `**${result.data.length} transactions** | Net: ${formattedTotalAmount} | Income: ${formattedIncomeAmount} | Expenses: ${formattedExpenseAmount}

| Date | Name | Amount | Category |
|------|------|--------|--------|
${formattedTransactions
  .map((tx) => `| ${tx.date} | ${tx.name} | ${tx.amount} | ${tx.category} |`)
  .join("\n")}`;

      // Return the data with link
      yield {
        text: response,
        link: {
          text: "View all transactions",
          url: `${getUrl()}/transactions}`,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
