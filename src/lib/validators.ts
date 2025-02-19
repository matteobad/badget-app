import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { category_table } from "~/server/db/schema/categories";
import { Provider } from "~/server/db/schema/enum";
import { transaction_table } from "~/server/db/schema/transactions";

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

export const TransactionInsertSchema = createInsertSchema(transaction_table, {
  date: z.coerce.date(),
  amount: z.coerce.string(),
  note: z.string().optional(),
})
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
    tags: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
      }),
    ),
  });

export type TransactionInsertSchema = z.infer<typeof TransactionInsertSchema>;

export const TransactionUpdateSchema = createInsertSchema(transaction_table, {
  id: z.string(),
  date: z.coerce.date().optional(),
  amount: z.coerce.string().optional(),
  note: z.string().optional(),
})
  .omit({
    userId: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
  })
  .extend({
    attachment_ids: z.array(z.string()),
  });

export const TransactionImportSchema = z.object({
  file: z.instanceof(File).refine((file) => ["text/csv"].includes(file.type), {
    message: "Invalid document file type",
  }),
  fieldMapping: z.object({
    date: z.string({ message: "Missing date mapping" }),
    description: z.string({ message: "Missing description mapping" }),
    amount: z.string({ message: "Missing amount mapping" }),
    currency: z.string().default("EUR"),
  }),
  extraFields: z.object({ accountId: z.string() }),
  settings: z.object({ inverted: z.boolean().default(false) }),
});
export type TransactionImportSchema = z.infer<typeof TransactionImportSchema>;

export const TransactionDeleteSchema = z.object({
  ids: z.array(z.string()),
});
export type TransactionDeleteSchema = z.infer<typeof TransactionDeleteSchema>;

export const AttachmentDeleteSchema = z.object({
  id: z.string(),
  fileKey: z.string(),
});
export type AttachmentDeleteSchema = z.infer<typeof AttachmentDeleteSchema>;

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
