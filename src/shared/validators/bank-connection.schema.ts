import { z } from "@hono/zod-openapi";
import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/shared/constants/enum";
import { parseAsString, parseAsStringLiteral } from "nuqs/server";

export const getBankConnectionsSchema = z
  .object({ enabled: z.boolean().optional() })
  .optional();

export const getOpenBankingAccountsSchema = z.object({
  id: z.string(),
  provider: z.enum(BANK_PROVIDER).optional(),
});

export const createBankConnectionSchema = z.object({
  referenceId: z.string(), // GoCardLess
  provider: z.enum(BANK_PROVIDER),
  accounts: z
    .array(
      z.object({
        accountId: z.string(),
        institutionId: z.string().optional(),
        logoUrl: z.string().nullable().optional(),
        name: z.string(),
        bankName: z.string(),
        currency: z.string(),
        enabled: z.boolean(),
        balance: z.number().optional(),
        type: z.enum(ACCOUNT_TYPE),
        accountReference: z.string().nullable().optional(), // EnableBanking & GoCardLess
        expiresAt: z.string().nullable().optional(), // EnableBanking & GoCardLess
        authoritativeFrom: z.string().nullable().optional(),
      }),
    )
    .refine((accounts) => accounts.some((account) => account.enabled), {
      message: "At least one account must be selected.", // You might want a more specific message depending on UI context
    }),
});

export const deleteBankConnectionSchema = z.object({ id: z.string() });

export const createGocardlessLinkSchema = z.object({
  institutionId: z.string(),
  step: z.string().optional(),
  availableHistory: z.number(),
  redirectBase: z.string(),
});

export const manualSyncConnectionSchema = z.object({
  connectionId: z.string(),
});

export const reconnectConnectionSchema = z.object({
  orgId: z.string(),
  connectionId: z.string(),
  provider: z.string(),
});

export const reconnectGocardlessLinkSchema = z.object({
  id: z.string(),
  institutionId: z.string(),
  redirectTo: z.string(),
});

// Search params for sheets
export const connectParamsSchema = (initialCountryCode?: string) => ({
  step: parseAsStringLiteral(["connect", "account"]),
  countryCode: parseAsString.withDefault(initialCountryCode ?? ""),
  provider: parseAsStringLiteral(Object.values(BANK_PROVIDER)),
  institution_id: parseAsString,
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  error: parseAsString,
  ref: parseAsString,
  details: parseAsString,
});
