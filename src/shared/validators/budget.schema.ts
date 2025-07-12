import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { budget_table } from "~/server/db/schema/budgets";
import { BUDGET_RECURRENCE } from "~/server/db/schema/enum";
import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { createSchemaFactory } from "drizzle-zod";
import { parseAsBoolean, parseAsIsoDate, parseAsString } from "nuqs/server";

// ref: https://orm.drizzle.team/docs/zod#factory-functions
const { createSelectSchema } = createSchemaFactory({
  zodInstance: z,
});

export const budgetResponseSchema = createSelectSchema(budget_table).omit({
  userId: true,
  deletedAt: true,
});

export const getBudgetsSchema = z.object({
  categoryId: z.uuid().optional(),
  from: z.iso.date().transform((data) => new Date(data)),
  to: z.iso.date().transform((data) => new Date(data)),
});

export const createBudgetSchema = z.object({
  categoryId: z.uuid().openapi({
    example: "f4621760-f97e-406c-b52f-13047ff94d6d", // transportation
    description: "The UUID of the category this budget belongs to.",
  }),
  amount: z.number().positive().openapi({
    example: 150,
    description:
      "The budgeted amount in the smallest currency unit (e.g., cents). Must be positive.",
  }),
  from: z.iso
    .date()
    .transform((data) => new Date(data))
    .openapi({
      example: "2026-01-01",
      description: "Start date of the budget period in ISO 8601 format.",
    }),
  to: z.iso
    .date()
    .transform((data) => new Date(data))
    .openapi({
      example: "2026-01-31",
      description: "End date of the budget period in ISO 8601 format.",
    }),
  recurrence: z.enum(BUDGET_RECURRENCE).nullable().openapi({
    example: "monthly",
    description:
      "Recurrence pattern for the budget (e.g., monthly, yearly). Null for one-time budgets.",
  }),
  recurrenceEnd: z.iso
    .date()
    .optional()
    .transform((data) => (data ? new Date(data) : undefined))
    .openapi({
      example: "2026-12-31",
      description:
        "End date for the recurrence period in ISO 8601 format. Optional.",
    }),
});

export const updateBudgetSchema = z.object({
  id: z.uuid().openapi({
    example: "f1a05084-73f6-4d62-b83f-d3a02fcbe617", // transportation
    description: "The UUID of the category this budget belongs to.",
  }),
  ...createBudgetSchema.shape,
});

export const deleteBudgetSchema = z.object({ id: z.cuid2() });

// Query filter schema
export const budgetFilterSchema = z.object({
  from: z.date().default(startOfMonth(new Date())),
  to: z.date().default(endOfMonth(new Date())),
  // deleted: z.boolean().default(false),
});

// Search params filter schema
export const budgetFilterParamsSchema = {
  from: parseAsIsoDate.withDefault(startOfMonth(new Date())),
  to: parseAsIsoDate.withDefault(startOfDay(endOfMonth(new Date()))),
};

// Search params for sheets
export const budgetParamsSchema = {
  budgetId: parseAsString,
  createBudget: parseAsBoolean,
};
