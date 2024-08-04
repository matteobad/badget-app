import { z } from "zod";

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
  pensionFundId: z.coerce.number(),
  investmentBranchId: z.coerce.number(),
  joinedAt: z.coerce.date().default(new Date()),
  baseTFRPercentage: z.coerce.number().default(0),
  baseEmployeePercentage: z.coerce.number().default(0),
  baseEmployerPercentage: z.coerce.number().default(0),
  baseContribution: z.string().optional(),
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
