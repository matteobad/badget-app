import { z } from "@hono/zod-openapi";

export const getIncomesSchema = z
  .object({
    from: z.string().openapi({
      description: "Start date (ISO 8601 format)",
      example: "2023-01-01",
    }),
    to: z.string().openapi({
      description: "End date (ISO 8601 format)",
      example: "2023-12-31",
    }),
    currency: z.string().optional().openapi({
      description: "Currency code (ISO 4217)",
      example: "USD",
    }),
  })
  .openapi("GetIncomesSchema");

export const getCategoryExpensesSchema = z
  .object({
    from: z.string().openapi({
      description: "Start date (ISO 8601 format)",
      example: "2023-01-01",
    }),
    to: z.string().openapi({
      description: "End date (ISO 8601 format)",
      example: "2023-12-31",
    }),
    currency: z.string().optional().openapi({
      description: "Currency code (ISO 4217)",
      example: "USD",
    }),
  })
  .openapi("GetCategoryExpenses");
