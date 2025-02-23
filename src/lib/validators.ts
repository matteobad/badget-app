import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { tag_table } from "~/server/db/schema/transactions";

// savings
export const addSavingsAccountFormSchema = z.object({
  type: z.enum(["pension", "emergency"], {
    required_error: "Please select an account type.",
  }),
});

export const CreatePensionAccountSchema = z.object({
  pensionFundId: z.number(),
  investmentBranchId: z.number(),
  joinedAt: z.date().default(new Date()),
  baseContribution: z.number().default(0),
});

export const TagInsertSchema = createInsertSchema(tag_table, {
  id: z.string(),
  text: z.string(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const ImportDataSchema = z.object({
  id: z.string(),
  provider: z.string(),
  connectionId: z.string(),
  institutionId: z.string(),
});

export const ToggleAccountSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
});
export type ToggleAccountType = z.infer<typeof ToggleAccountSchema> & {
  userId: string;
};
