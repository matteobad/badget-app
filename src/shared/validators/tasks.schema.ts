import z from "zod/v4";
import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/shared/constants/enum";

export const initialBankSetupSchema = z.object({
  orgId: z.string(),
  connectionId: z.uuid(),
});

export const syncConnectionSchema = z.object({
  connectionId: z.uuid(),
  manualSync: z.boolean().optional(),
});

export const syncAccountSchema = z.object({
  id: z.uuid(),
  organizationId: z.string(),
  accountId: z.string(),
  errorRetries: z.number().optional(),
  provider: z.enum(BANK_PROVIDER),
  manualSync: z.boolean().optional(),
  accountType: z.enum(ACCOUNT_TYPE),
  logoUrl: z.url().optional(),
});

export const deleteConnectionSchema = z.object({
  referenceId: z.string(),
  provider: z.enum(BANK_PROVIDER),
});
