import { z } from "zod";

import { Provider } from "~/server/db/schema/enum";
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

export const deletePostSchema = z.object({
  id: z.number(),
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
