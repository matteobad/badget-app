import { z } from "zod";
import { WIDGET } from "~/server/cache/widget-preferences-cache";

// export const getRunwaySchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   currency: z.string().optional(),
// });

// export const getRevenueSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   currency: z.string().optional(),
// });

// export const getRevenueSummarySchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   currency: z.string().optional(),
//   revenueType: z.enum(["gross", "net"]).optional().default("net"),
// });

// export const getGrowthRateSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   currency: z.string().optional(),
//   type: z.enum(["revenue", "profit"]).optional().default("revenue"),
//   revenueType: z.enum(["gross", "net"]).optional().default("net"),
//   period: z
//     .enum(["quarterly", "monthly", "yearly"])
//     .optional()
//     .default("quarterly"),
// });

// export const getProfitMarginSchema = z.object({
//   from: z.string(),
//   to: z.string(),
//   currency: z.string().optional(),
//   revenueType: z.enum(["gross", "net"]).optional().default("net"),
// });

export const getAccountBalancesSchema = z
  .object({
    currency: z.string().optional(),
  })
  .optional();

export const getCashFlowSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getNetWorthSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getSavingAnalysisSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getMonthlyIncomeSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getMonthlySpendingSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getCategoryExpensesSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
  limit: z.number().optional().default(5),
});

export const getRecurringExpensesSchema = z.object({
  from: z.string(),
  to: z.string(),
  currency: z.string().optional(),
});

export const getVaultActivitySchema = z.object({
  limit: z.number().optional().default(5),
});

export const getIncomeForecastSchema = z.object({
  from: z.string(),
  to: z.string(),
  forecastMonths: z.number().min(1).max(24).default(6),
  currency: z.string().optional(),
});

export const widgetTypeSchema = z.enum(WIDGET);

export const widgetPreferencesSchema = z.object({
  primaryWidgets: z.array(widgetTypeSchema).max(7),
  availableWidgets: z.array(widgetTypeSchema),
});

export const updateWidgetPreferencesSchema = z.object({
  primaryWidgets: z.array(widgetTypeSchema).max(7),
});

export const widgetPeriodSchema = z.enum([
  "this_month",
  "last_month",
  "this_week",
  "last_week",
  "this_year",
  "last_3_months",
  "last_6_months",
  "last_12_months",
]);

export const revenueTypeSchema = z.enum(["net", "gross"]);

export const widgetConfigSchema = z.object({
  period: widgetPeriodSchema.optional(),
  revenueType: revenueTypeSchema.optional(),
});

export const updateWidgetConfigSchema = z.object({
  widgetType: widgetTypeSchema,
  config: widgetConfigSchema,
});
