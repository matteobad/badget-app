import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import {
  BankAccountType,
  ConnectionStatus,
  Provider,
} from "~/server/db/schema/enum";
import {
  bankAccounts,
  bankConnections,
  bankTransactions,
  categories,
  categoryBudgets,
} from "~/server/db/schema/open-banking";
import { ContractType } from "~/server/db/schema/working-records";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export type DateRange = {
  from: Date;
  to: Date;
};

export const CreatePostSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

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

// work
export const CreateWorkSchema = z.object({
  company: z.string().optional(),
  contract: z.nativeEnum(ContractType),
  ral: z.number(),
  date: z.object({
    from: z.date(),
    to: z.date().optional(),
  }),
  toDate: z.date().optional(),
});

export const createGoCardLessLinkSchema = z.object({
  institutionId: z.string(),
  step: z.string().optional(),
  availableHistory: z.number(),
  redirectBase: z.string(),
});

export const updateInstitutionUsageSchema = z.object({
  institutionId: z.string(),
});

export const connectBankAccountSchema = z.object({
  referenceId: z.string().nullable().optional(), // GoCardLess
  provider: z.nativeEnum(Provider),
  accounts: z.array(
    z.object({
      account_id: z.string(),
      bank_name: z.string(),
      balance: z.string().default("0"),
      currency: z.string().default("EUR"),
      name: z.string(),
      institution_id: z.string(),
      enabled: z.boolean(),
      logo_url: z.string(),
      // type: z.nativeEnum(BankAccountType).optional(),
    }),
  ),
});

export const importBankTransactionSchema = z.object({
  bankAccountIds: z.array(z.string()), // GoCardLess
  latest: z.boolean(),
});

// Bank Connections
export const upsertBankConnectionsSchema = createInsertSchema(bankConnections, {
  provider: z.nativeEnum(Provider),
  status: z.nativeEnum(ConnectionStatus),
}).extend({
  accounts: z.array(
    createInsertSchema(bankAccounts, {
      type: z.nativeEnum(BankAccountType),
    }),
  ),
});

// Schema for inserting a category - can be used to validate API requests
export const createBankAccountSchema = createInsertSchema(bankAccounts).pick({
  name: true,
  balance: true,
  currency: true,
});

export const updateBankAccountSchema = createInsertSchema(bankAccounts).pick({
  id: true,
  name: true,
  type: true,
  balance: true,
  currency: true,
});

export const toggleBankAccountSchema = createInsertSchema(bankAccounts).pick({
  id: true,
  enabled: true,
});

// Transaction
export const insertBankTransactionSchema = createInsertSchema(bankTransactions);

export const editBankTransactionSchema = createInsertSchema(
  bankTransactions,
).pick({
  categoryId: true,
  description: true,
  amount: true,
});

// Category
export const upsertCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.name.toLowerCase(),
  macro: (schema) => schema.macro.toLowerCase(),
})
  .pick({
    id: true,
    name: true,
    icon: true,
    color: true,
    macro: true,
    type: true,
  })
  .extend({
    budgets: z.array(
      createInsertSchema(categoryBudgets).pick({
        budget: true,
        period: true,
        activeFrom: true,
      }),
    ),
  });

export const updateCategorySchema = createInsertSchema(categories, {
  name: (schema) => schema.name.toLowerCase(),
  macro: (schema) => schema.macro.toLowerCase(),
}).pick({
  id: true,
  name: true,
  icon: true,
  color: true,
  macro: true,
  type: true,
});

export const upsertCategoryBudgetSchema = z.object({
  budgets: z.array(
    createInsertSchema(categoryBudgets).pick({
      id: true,
      budget: true,
      period: true,
      activeFrom: true,
      categoryId: true,
    }),
  ),
});

export const deleteCategorySchema = z.object({
  name: z.string(),
  categoryId: z.number(),
});
