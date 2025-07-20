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
