import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { category, categoryBudgets } from "~/server/db/schema/categories";
import {
  BankAccountType,
  ConnectionStatus,
  Provider,
} from "~/server/db/schema/enum";
import {
  bankAccounts,
  bankConnections,
  bankTransactions,
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
export const connectAccountSchema = z.object({
  reference: z.string().min(1),
  provider: z.nativeEnum(Provider),
  accountIds: z.array(z.string().min(1)),
});

export const upsertBankConnectionSchema = z.object({
  connection: createInsertSchema(bankConnections, {
    status: z.nativeEnum(ConnectionStatus),
    provider: z.nativeEnum(Provider),
  }),
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

export const selectBankAccountsSchema = z.object({
  accounts: z.array(
    createInsertSchema(bankAccounts).pick({
      accountId: true,
      enabled: true,
    }),
  ),
});

// Transaction
export const insertBankTransactionSchema = createInsertSchema(bankTransactions);

export const updateBankTransactionSchema = z.object({
  id: z.number(),
  description: z.string().optional(),
  categoryId: z.number().nullable(),
  userId: z.string().min(1),
});

export const updateTransactionCategoryBulkSchema = z.object({
  transactions: z.array(updateBankTransactionSchema),
});

// Category
export const upsertCategorySchema = createInsertSchema(category, {
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

export const updateCategorySchema = createInsertSchema(category, {
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
  categoryId: z.number(),
});

export const dashboardSearchParamsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const updateCategoryRuleSchema = z.object({
  categoryId: z.number(),
  description: z.string().min(1),
});

export const transactionsSearchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  description: z.string().optional(),
  sort: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  category: z.string().optional(),
  account: z.string().optional(),
});

export const accountsSearchParamsSchema = z.object({
  q: z.string().optional(),
  ref: z.string().optional(),
});

export const institutionsSearchParamsSchema = z.object({
  q: z.string().optional(),
});
