import { ACCOUNT_TYPE, BANK_PROVIDER } from "~/server/db/schema/enum";
import z from "zod/v4";

export const initialBankSetupSchema = z.object({
  userId: z.string(),
  connectionId: z.uuid(),
});

export type InitialBankSetupPayload = z.infer<typeof initialBankSetupSchema>;

export const syncConnectionSchema = z.object({
  connectionId: z.uuid(),
  manualSync: z.boolean().optional(),
});

export type SyncConnectionPayload = z.infer<typeof syncConnectionSchema>;

export const syncAccountSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  accountId: z.string(),
  errorRetries: z.number().optional(),
  provider: z.enum(BANK_PROVIDER),
  manualSync: z.boolean().optional(),
  accountType: z.enum(ACCOUNT_TYPE),
});

export type SyncAccountPayload = z.infer<typeof syncAccountSchema>;
