import { getAssets } from "~/server/services/asset-service";
import { formatAmount } from "~/shared/helpers/format";
import { getUrl } from "~/shared/helpers/get-url";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../context";

const getBalancesSchema = z.object({
  currency: z
    .string()
    .describe("Optional currency code (e.g., 'EUR', 'USD').")
    .nullable()
    .optional(),
  showCanvas: z
    .boolean()
    .default(false)
    .describe(
      "Whether to show detailed visual analytics (e.g., account distribution charts).",
    ),
});

export const getBalancesTool = tool({
  description:
    "Retrieve current account balances, including breakdown by account and total net balance. Use this tool when users ask about available cash, bank account status, or liquidity.",
  inputSchema: getBalancesSchema,
  execute: async function* ({ currency }) {
    try {
      const context = getContext();

      const assets = await getAssets(
        context.db,
        {}, // TODO: filter by account name
        context.user.organizationId,
      );

      if (!assets || assets.length === 0) {
        yield { text: "No balances available." };
        return;
      }

      const targetCurrency = currency ?? context.user.baseCurrency ?? "EUR";

      const totalBalance = assets.reduce((sum, acc) => sum + acc.balance, 0);

      const formattedTotal = formatAmount({
        amount: totalBalance,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const accountLines = assets
        .map((acc) => {
          const formattedAmount = formatAmount({
            amount: acc.balance,
            currency: acc.currency || targetCurrency,
            locale: context.user.locale ?? undefined,
          });
          return `- ${acc.name}: ${formattedAmount}`;
        })
        .join("\n");

      const response = `**Balances Overview**
**Total Balance:** ${formattedTotal}
**Accounts:**
${accountLines}`;

      yield {
        text: response,
        link: {
          text: "View all accounts",
          url: `${getUrl()}/accounts`,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
