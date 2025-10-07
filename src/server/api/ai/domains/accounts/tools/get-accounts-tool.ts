import { getBankAccounts } from "~/server/services/bank-account-service";
import { ACCOUNT_SUBTYPE, ACCOUNT_TYPE } from "~/shared/constants/enum";
import { tool } from "ai";
import z from "zod";

import { cached } from "../../../cache";
import { getContext } from "../../../context";

// Output schema: chiaro e UI-oriented
const bankAccountSchema = z.object({
  id: z.string().describe("Unique identifier of the bank account."),
  name: z
    .string()
    .describe("Human-readable name of the account (e.g. 'Revolut EUR')."),
  description: z
    .string()
    .nullable()
    .describe(
      "User personal description of the account (e.g. 'Main account').",
    ),
  institution: z
    .object({
      name: z.string().describe("Name of the financial institution."),
      logo: z
        .string()
        .nullable()
        .describe("Logo url of the financial institution, if any."),
    })
    .nullable()
    .describe("Financial institution, if any."),
  type: z.string().describe("High-level category (asset, liability)."),
  subtype: z
    .string()
    .nullable()
    .describe("Specific subtype (current, joint, card, etc.)."),
  balance: z.number().describe("Current balance of the account."),
  currency: z.string().describe("Currency code, e.g. 'EUR'."),
  enabled: z.boolean().describe("Whether the account is active."),
  manual: z.boolean().describe("True if manually created by the user."),
  updatedAt: z.date().optional().describe("Last synchronization date."),
});

const getAccountsSchema = z.object({
  q: z
    .string()
    .optional()
    .describe(
      "Search query for filtering bank accounts by name or description.",
    ),
  type: z
    .enum(ACCOUNT_TYPE)
    .optional()
    .describe(
      `Filter bank accounts by their type (e.g. ${Object.values(ACCOUNT_TYPE).join(", ")}).`,
    ),
  subtype: z
    .enum(ACCOUNT_SUBTYPE)
    .optional()
    .describe(
      `Filter bank accounts by their subtype (e.g. ${Object.values(ACCOUNT_SUBTYPE).join(", ")}).`,
    ),
  enabled: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      "If true, only return enabled accounts; if false, only return disabled accounts; if omitted, return all.",
    ),
  manual: z
    .boolean()
    .optional()
    .describe(
      "If true, only return manually created accounts; if false, only return non-manual accounts; if omitted, return all.",
    ),
});

export const getAccountsTool = cached(
  tool({
    description: `
      Retrieves bank accounts of the current user.

      Use this tool when:
      - the user asks to list, search, or view their bank accounts,
      - they mention accounts by name (e.g. “my Revolut account”),
      - they want only active/inactive, manual, or connected accounts,
      - or they ask about available account types or balances.

      Never use this tool to get transactions or historical balances.

      Returns a structured list of accounts, ideal for display in tables or cards.
      Each item includes id, name, type, subtype, balance, currency, and metadata.
    `,
    inputSchema: getAccountsSchema,
    outputSchema: z.array(bankAccountSchema),
    execute: async function (input) {
      const context = getContext();

      try {
        // Get accounts from database
        const result = await getBankAccounts(
          context.db,
          input,
          context.user.organizationId,
        );

        // Return validated output
        return z.array(bankAccountSchema).parse(result ?? []);
      } catch (error) {
        console.error("getAccountsTool error:", error);
        throw new Error("Failed to retrieve bank accounts.");
      }
    },
  }),
);
