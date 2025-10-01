import { artifact } from "@ai-sdk-tools/artifacts";
import { z } from "zod";

import { toastSchema } from "../tools/schema";

export const expensesBreakdownArtifact = artifact(
  "expenses-breakdown",
  z.object({
    // Processing stage
    stage: z.enum([
      "loading",
      "chart_ready",
      "metrics_ready",
      "analysis_ready",
    ]),

    // Basic info
    currency: z.string(),

    toast: toastSchema,

    // Chart data (available at chart_ready stage)
    chart: z
      .object({
        categoryData: z.array(
          z.object({
            name: z.string(),
            amount: z.number(),
            percentage: z.number(),
            color: z.string(),
          }),
        ),
      })
      .optional(),

    // Core metrics (available at metrics_ready stage)
    metrics: z
      .object({
        total: z.number(),
        topCategory: z.object({
          name: z.string(),
          percentage: z.number(),
          amount: z.number(),
        }),
        recurringExpenses: z.object({
          amount: z.number(),
          percentage: z.number(),
        }),
        uncategorizedTransactions: z.object({
          amount: z.number(),
          percentage: z.number(),
        }),
      })
      .optional(),

    // Analysis data (available at analysis_ready stage)
    analysis: z
      .object({
        summary: z.string(),
        recommendations: z.array(z.string()),
      })
      .optional(),
  }),
);
