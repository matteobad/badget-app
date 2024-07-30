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
  pensionFundId: z.string().min(1, { message: "Pension fund is required" }),
  investmentBranchId: z
    .string()
    .min(1, { message: "Investment branch is required" }),
  joinedAt: z.date().default(new Date()),
  baseTFRPercentage: z.number().default(0),
  baseEmployeePercentage: z.number().default(0),
  baseEmployerPercentage: z.number().default(0),
});
