import { getBankAccounts } from "~/server/services/bank-account-service";
import { formatAmount } from "~/shared/helpers/format";
import { getUrl } from "~/shared/helpers/get-url";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../../context";

const getAccountsSchema = z.object({
  enabled: z.boolean(),
  manual: z.boolean().optional(),
});

export const getAccountsTool = tool({
  description:
    "Search and retrieve bank accounts with flexible filtering options. Use this tool to find accounts by name, type, subtype, or status, or when users request a list or details of their bank accounts.",
  inputSchema: getAccountsSchema,
  execute: async function* ({ enabled, manual }) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        // organizationId: context.user.organizationId,
        // q: q ?? null,
        // type: type ?? null,
        // subtype: subtype ?? null,
        enabled: enabled,
        manual: manual ?? undefined,
      };

      // Get accounts from database
      const result = await getBankAccounts(params, context.user.organizationId);

      // Early return if no data
      if (result.length === 0) {
        yield { text: "No accounts found matching your criteria." };
      }

      // Get the target currency for display
      const targetCurrency = context.user.baseCurrency ?? "EUR";

      // Format accounts for markdown display
      const formattedAccounts = result.map((account) => {
        const formattedAmount = formatAmount({
          amount: account.balance,
          currency: account.currency ?? targetCurrency,
          locale: context.user.locale ?? undefined,
        });

        return {
          id: account.id,
          name: account.name,
          logoUrl: account.logoUrl,
          type: account.type,
          subtype: account.subtype,
          balance: formattedAmount,
        };
      });

      // Calculate summary statistics
      const assetsBalance = result
        .filter((t) => t.type === "asset")
        .reduce((sum, t) => sum + t.balance, 0);

      const liabilitiesBalance = Math.abs(
        result
          .filter((t) => t.type === "liability")
          .reduce((sum, t) => sum + t.balance, 0),
      );

      const totalAmount = assetsBalance - liabilitiesBalance;

      const formattedTotalAmount = formatAmount({
        amount: totalAmount,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const formattedAssetsAmount = formatAmount({
        amount: assetsBalance,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      const formattedLiabilitiesAmount = formatAmount({
        amount: liabilitiesBalance,
        currency: targetCurrency,
        locale: context.user.locale ?? undefined,
      });

      // Table format
      const response = `
        **${result.length} accounts** | Net: ${formattedTotalAmount} | Assets: ${formattedAssetsAmount} | Liabilities: ${formattedLiabilitiesAmount}

        | Name | Type | Balance |
        |------|------|---------|
        ${formattedAccounts
          .filter((a) => a.type === "asset")
          .map((a) => `| ${a.name} | ${a.subtype} | ${a.balance} |`)
          .join("\n")}
          
        | Name | Type | Balance |
        |------|------|---------|
        ${formattedAccounts
          .filter((a) => a.type === "liability")
          .map((a) => `| ${a.name} | ${a.subtype} | ${a.balance} |`)
          .join("\n")}
      `;

      // Return the data with link
      yield {
        text: response,
        link: {
          text: "View all accounts",
          url: `${getUrl()}/accounts}`,
        },
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
