import { budget_table } from "~/server/db/schema/budgets";
import { BUDGET_RECURRENCE } from "~/server/db/schema/enum";
import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { createSelectSchema } from "drizzle-zod";
import { parseAsBoolean, parseAsIsoDate, parseAsString } from "nuqs/server";
import z from "zod/v4";

export const selectBudgetSchema = createSelectSchema(budget_table);

export const getBudgetSchema = z.object({
  categoryId: z.string().min(1),
});

// export const createBudgetSchema = createInsertSchema(budget_table, {
//   period: z.enum(BUDGET_PERIOD).default(BUDGET_PERIOD.MONTHLY),
// });

export const createBudgetSchema = z.object({
  categoryId: z.cuid2(),
  amount: z.number().min(0),
  recurrence: z.enum(BUDGET_RECURRENCE).nullable(),
  from: z.date().default(new Date()),
  repeat: z.boolean().default(true),
});

export const updateBudgetSchema = z.object({
  id: z.cuid2(),
  categoryId: z.cuid2(),
  amount: z.number().min(0),
  recurrence: z.enum(BUDGET_RECURRENCE).default(BUDGET_RECURRENCE.MONTHLY),
  from: z.date().default(new Date()),
  repeat: z.boolean().default(true),
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
