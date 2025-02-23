import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { category_table } from "~/server/db/schema/categories";
import { Provider } from "~/server/db/schema/enum";
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

export const ConnectGocardlessSchema = z.object({
  institutionId: z.string(),
  countryCode: z.string().default("IT"),
  provider: z.nativeEnum(Provider),
  redirectBase: z.string().url(),
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

export const CategoryInsertSchema = createInsertSchema(category_table, {
  description: z.string().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CategoryUpdateSchema = createInsertSchema(category_table, {
  id: z.string(),
  description: z.string().optional(),
}).omit({
  userId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const CategoryDeleteSchema = z.object({
  ids: z.array(z.string()),
});
