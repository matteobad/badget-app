import { z } from "@hono/zod-openapi";

export const getIncomeAnalysisSchema = z
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
  .openapi("getIncomeAnalysisSchema");

export const getMonthlySpendingSchema = z
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
  .openapi("getMonthlySpendingSchema");

export const getUncategorizedSchema = z
  .object({
    from: z.string().optional().openapi({
      description: "Start date (ISO 8601 format)",
      example: "2023-01-01",
    }),
    to: z.string().optional().openapi({
      description: "End date (ISO 8601 format)",
      example: "2023-12-31",
    }),
    currency: z.string().optional().openapi({
      description: "Currency code (ISO 4217)",
      example: "USD",
    }),
  })
  .openapi("getUncategorizedSchema");
