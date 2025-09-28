import { getIncome } from "~/server/services/reports-service";
import { formatAmount } from "~/shared/helpers/format";
import { getUrl } from "~/shared/helpers/get-url";
import { tool } from "ai";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import z from "zod";

import { getContext } from "../../context";

const getIncomeSchema = z.object({
  from: z
    .string()
    .default(() => startOfMonth(subMonths(new Date(), 12)).toISOString())
    .describe(
      "The start date when to retrieve income data from. Defaults to 12 months ago. ISO-8601 format.",
    ),
  to: z
    .string()
    .default(() => endOfMonth(new Date()).toISOString())
    .describe(
      "The end date when to retrieve income data until. Defaults to end of current month. ISO-8601 format.",
    ),
  currency: z
    .string()
    .describe("Optional currency code (e.g., 'EUR', 'USD').")
    .nullable()
    .optional(),
  showCanvas: z
    .boolean()
    .default(false)
    .describe(
      "Whether to show detailed visual analytics (charts, trends, breakdowns).",
    ),
});

export const getIncomeTool = tool({
  description:
    "Retrieve and analyze income over a given period, highlighting total income, main sources, and trends. Use this tool when users ask about salary, revenue, or other income streams.",
  inputSchema: getIncomeSchema,
  execute: async function* ({ from, to, currency }) {
    try {
      const context = getContext();

      const data = await getIncome(context.db, {
        organizationId: context.user.organizationId,
        from,
        to,
        currency: currency ?? context.user.baseCurrency ?? "EUR",
      });

      if (!data || data.total === 0) {
        yield { text: "No income data available for the selected period." };
        return;
      }

      const targetCurrency = currency ?? context.user.baseCurrency ?? "EUR";

      const formattedTotal = formatAmount({
        amount: data.total,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const topSources = data.sources
        .slice(0, 5)
        .map(
          (s) =>
            `- ${s.name}: ${formatAmount({
              amount: s.amount,
              currency: targetCurrency,
              locale: context.user.locale ?? undefined,
            })} (${s.percentage}%)`,
        )
        .join("\n");

      const response = `**Income Summary**
**Total Income:** ${formattedTotal}
**Top Sources:**
${topSources}`;

      yield {
        text: response,
        link: {
          text: "View all income",
          url: `${getUrl()}/income`,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
