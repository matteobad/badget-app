import z from "zod/v4";

export const getBankAccountsSchema = z.object({
  enabled: z.boolean().optional(),
  manual: z.boolean().optional(),
});
