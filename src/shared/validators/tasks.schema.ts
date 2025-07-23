import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/shared/constants/enum";
import z from "zod/v4";

export const initialBankSetupSchema = z.object({
  userId: z.string(),
  connectionId: z.uuid(),
});

export const syncConnectionSchema = z.object({
  connectionId: z.uuid(),
  manualSync: z.boolean().optional(),
});

export const syncAccountSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  accountId: z.string(),
  errorRetries: z.number().optional(),
  provider: z.enum(BANK_PROVIDER),
  manualSync: z.boolean().optional(),
  accountType: z.enum(ACCOUNT_TYPE),
});

export const deleteConnectionSchema = z.object({
  referenceId: z.string(),
  provider: z.enum(BANK_PROVIDER),
});
