import { z } from "@hono/zod-openapi";
import { BANK_PROVIDER } from "~/server/db/schema/enum";
import { parseAsString, parseAsStringLiteral } from "nuqs/server";

export const getBankConnectionsSchema = z
  .object({ enabled: z.boolean().optional() })
  .optional();

export const createBankConnectionSchema = z.object({
  accessToken: z.string().nullable().optional(), // Teller
  enrollmentId: z.string().nullable().optional(), // Teller
  referenceId: z.string().nullable().optional(), // GoCardLess
  provider: z.enum(["gocardless", "teller", "plaid", "enablebanking"]),
  accounts: z.array(
    z.object({
      accountId: z.string(),
      institutionId: z.string(),
      logoUrl: z.string().nullable().optional(),
      name: z.string(),
      bankName: z.string(),
      currency: z.string(),
      enabled: z.boolean(),
      balance: z.number().optional(),
      type: z.enum([
        "credit",
        "depository",
        "other_asset",
        "loan",
        "other_liability",
      ]),
      accountReference: z.string().nullable().optional(), // EnableBanking & GoCardLess
      expiresAt: z.string().nullable().optional(), // EnableBanking & GoCardLess
    }),
  ),
});

export const deleteBankConnectionSchema = z.object({ id: z.string() });

export const createGocardlessLinkSchema = z.object({
  institutionId: z.string(),
  step: z.string().optional(),
  availableHistory: z.number(),
  redirectBase: z.string(),
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
