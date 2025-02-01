import { z } from "zod";

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
