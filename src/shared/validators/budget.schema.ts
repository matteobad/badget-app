import { z } from "@hono/zod-openapi"; // Extended Zod instance
import { BUDGET_RECURRENCE } from "~/shared/constants/enum";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { parseAsBoolean, parseAsString } from "nuqs/server";

// ref: https://orm.drizzle.team/docs/zod#factory-functions
// const { createSelectSchema } = createSchemaFactory({
//   zodInstance: z,
// });

export const budgetResponseSchema = z
  .object({
    id: z.uuid(),
    categoryId: z.uuid(),
    amount: z.number().positive(),
    from: z.date(),
    to: z.date(),
    recurrence: z.enum(BUDGET_RECURRENCE).nullable(),
    recurrenceEnd: z.date().nullable(),
  })
  .openapi("Budget");

export const budgetsResponseSchema = z.object({
  data: z.array(budgetResponseSchema).nullable(),
});

export const getBudgetsSchema = z.object({
  categoryId: z.uuid().optional(),
  from: z.iso
    .date()
    .transform((data) => new Date(data))
    .openapi({
      example: "2025-01-01",
      description: "Start date of the budget period in ISO 8601 format.",
    }),
  to: z.iso
    .date()
    .transform((data) => new Date(data))
    .openapi({
      example: "2025-01-31",
      description: "End date of the budget period in ISO 8601 format.",
    }),
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
  recurrence: z.enum(BUDGET_RECURRENCE).nullable().optional().openapi({
    example: "monthly",
    description:
      "Recurrence pattern for the budget (e.g., monthly, yearly). Null for one-time budgets.",
  }),
  recurrenceEnd: z.iso
    .date()
    .nullable()
    .optional()
    .transform((data) => (data ? new Date(data) : undefined))
    .openapi({
      example: "2026-12-31",
      description:
        "End date for the recurrence period in ISO 8601 format. Optional.",
    }),
});

export const updateBudgetSchema = createBudgetSchema
  .omit({ categoryId: true })
  .extend({
    id: z.uuid().openapi({
      example: "f1a05084-73f6-4d62-b83f-d3a02fcbe617", // transportation
      description: "The UUID of the category this budget belongs to.",
    }),
    isOverride: z.boolean().default(true),
  })
  .check(({ value, issues }) => {
    const now = new Date();

    // 1. When recurrence is defined, recurrenceEnd must be defined
    if (value.recurrence && !value.recurrenceEnd)
      issues.push({
        code: "custom",
        input: value.recurrenceEnd,
        message: "recurrenceEnd is required when recurrence is set.",
      });

    // 2. Recurrence type should match with from-to distance
    if (value.recurrence && value.from && value.to) {
      const from =
        value.from instanceof Date ? value.from : new Date(value.from);
      const to = value.to instanceof Date ? value.to : new Date(value.to);
      const diffDays = Math.round(
        (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
      );
      const recurrenceMap: Record<string, (days: number) => boolean> = {
        monthly: (days) => days >= 27 && days <= 31,
        yearly: (days) => days >= 364 && days <= 366,
        weekly: (days) => days >= 6 && days <= 7,
      };
      const checkRecurrence = recurrenceMap[value.recurrence];
      if (checkRecurrence && !checkRecurrence(diffDays)) {
        issues.push({
          code: "custom",
          input: [value.from, value.to],
          message: `The period between 'from' and 'to' does not match the expected duration for '${value.recurrence}' recurrence.`,
        });
      }
    }

    // 3. Cannot update closed budget
    // A budget is closed if:
    //   - recurrenceEnd is in the past (if recurrence)
    //   - or, if no recurrence, to is in the past
    if (value.recurrence) {
      if (value.recurrenceEnd && new Date(value.recurrenceEnd) < now) {
        issues.push({
          code: "custom",
          input: value.recurrenceEnd,
          message:
            "Cannot update a closed budget (recurrenceEnd is in the past).",
        });
      }
    } else {
      if (value.to && new Date(value.to) < now) {
        issues.push({
          code: "custom",
          input: value.to,
          message: "Cannot update a closed budget (to date is in the past).",
        });
      }
    }
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
  from: parseAsString.withDefault(
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
  ),
  to: parseAsString.withDefault(format(endOfMonth(new Date()), "yyyy-MM-dd")),
};

// Search params for sheets
export const budgetParamsSchema = {
  budgetId: parseAsString,
  createBudget: parseAsBoolean,
};
