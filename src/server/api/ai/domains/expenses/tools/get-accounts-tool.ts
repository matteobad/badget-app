import { getBankAccounts } from "~/server/services/bank-account-service";
import { formatAmount } from "~/shared/helpers/format";
import { getUrl } from "~/shared/helpers/get-url";
import { tool } from "ai";
import z from "zod";

import { getContext } from "../../../context";

const getAccountsSchema = z.object({
  enabled: z
    .boolean()
    .describe("Whether to include only enabled (active) accounts."),
  manual: z
    .boolean()
    .optional()
    .describe(
      "If true, only return manually created accounts; if false, only return non-manual accounts; if omitted, return all.",
    ),
});

export const getAccountsTool = tool({
  description:
    "Search and retrieve bank accounts with flexible filtering options. Use this tool to find accounts by name, type, subtype, or status, or when users request a list or details of their bank accounts.",
  inputSchema: getAccountsSchema,
  execute: async function ({ enabled, manual }) {
    try {
      const context = getContext();

      // Prepare parameters for the database query
      const params = {
        organizationId: context.user.organizationId,
        // q: q ?? null,
        // type: type ?? null,
        // subtype: subtype ?? null,
        enabled: enabled,
        manual: manual ?? undefined,
      };

      // Get accounts from database
      const result = await getBankAccounts(params, context.user.organizationId);

      // Early return if no data
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
});
