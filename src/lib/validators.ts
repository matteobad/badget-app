import { z } from "zod";

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  errors?: Record<string, string[]>;
};

export const CreatePostSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
});

export const deletePostSchema = z.object({
  id: z.number(),
});

// pension
export const CreatePensionAccountSchema = z.object({
  pensionFundId: z.coerce.number(),
  investmentBranchId: z.coerce.number(),
  joinedAt: z.coerce.date().default(new Date()),
  baseTFRPercentage: z.coerce.number().default(0),
  baseEmployeePercentage: z.coerce.number().default(0),
  baseEmployerPercentage: z.coerce.number().default(0),
  baseContribution: z.string().optional(),
});
