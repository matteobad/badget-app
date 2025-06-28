import { budget_table } from "~/server/db/schema/budgets";
import { BUDGET_PERIOD } from "~/server/db/schema/enum";
import { TimezoneRange } from "~/server/db/utils";
import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { parseAsBoolean, parseAsIsoDate, parseAsString } from "nuqs/server";
import { Range, RANGE_LB_INC } from "postgres-range";
import z from "zod/v4";

import { dateRangeSchema } from "./common.schema";

export const selectBudgetSchema = createSelectSchema(budget_table);

export const createBudgetSchema = createInsertSchema(budget_table, {
  period: z.enum(BUDGET_PERIOD),
})
  .omit({
    id: true,
    sysPeriod: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    userId: true,
  })
  .extend({
    dateRange: dateRangeSchema,
    repeat: z.boolean(),
  });

export const updateBudgetSchema = createUpdateSchema(budget_table, {
  id: z.cuid2(),
  period: z.enum(Object.values(BUDGET_PERIOD)),
})
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    from: z.date().nullable(),
    to: z.date().nullable(),
  })
  .transform((budget) => {
    const range = new Range<Date>(budget.from, budget.to, RANGE_LB_INC);

    return {
      id: budget.id,
      amount: budget.amount,
      period: budget.period,
      sys_period: new TimezoneRange(range),
    };
  });

export const deleteBudgetSchema = z.object({ id: z.cuid2() });

// Query filter schema
export const budgetFilterSchema = z.object({
  from: z.date().default(startOfMonth(new Date())),
  to: z.date().default(endOfMonth(new Date())),
  // deleted: z.boolean().default(false),
});

// Search params filter schema
export const BudgetFilterParamsSchema = {
  from: parseAsIsoDate.withDefault(startOfMonth(new Date())),
  to: parseAsIsoDate.withDefault(startOfDay(endOfMonth(new Date()))),
  deleted: parseAsBoolean.withDefault(false),
};

// Search params for sheets
export const budgetParamsSchema = {
  budgetId: parseAsString,
  createBudget: parseAsBoolean,
};
