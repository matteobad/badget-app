import type { CategoryType } from "~/shared/constants/enum";
import { z } from "zod/v4";

// Structured output schema for LLM response (for use with output: "array")
export function buildEnrichmentSchema(userCategories: string[]) {
  return z.object({
    merchant: z
      .string()
      .nullable()
      .describe("The formal legal business entity name"),
    category: z
      .string()
      .nullable()
      .refine((val) => val === null || userCategories.includes(val), {
        message: "Category must be one of the user’s categories",
      })
      .describe("The category of the transaction"),
  });
}

// Types
export type TransactionData = {
  description: string;
  amount: string;
  currency: string;
};

export type CategoryData = {
  slug: string;
  name: string;
  description: string | null;
  type: CategoryType;
  parentSlug: string | null;
};

export type UpdateData = {
  merchantName?: string;
  categorySlug?: string;
};
