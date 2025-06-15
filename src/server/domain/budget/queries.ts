"server-only";

import type { budgetFilterSchema } from "~/shared/validators/budget.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { budget_table } from "~/server/db/schema/budgets";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";

export const getBudgetsQuery = (
  filters: z.infer<typeof budgetFilterSchema>,
  userId: string,
) => {
  const where = [eq(budget_table.userId, userId)];

  if (filters?.from && filters.to) {
    where.push(
      sql`${budget_table.sysPeriod} && tstzrange(${filters.from.toISOString()}, ${filters.to.toISOString()}, '[]')`,
    );
  }

  if (filters?.deleted) {
    where.push(isNotNull(budget_table.deletedAt));
  } else {
    where.push(isNull(budget_table.deletedAt));
  }

  return db
    .select({
      id: budget_table.id,
      categoryId: budget_table.categoryId,
      amount: budget_table.amount,
      period: budget_table.period,
      startDate: sql`lower(${budget_table.sysPeriod})`.as("startDate"),
      endDate: sql`upper(${budget_table.sysPeriod})`.as("endDate"),
    })
    .from(budget_table)
    .where(and(...where));
};

export async function getBudgetByIdQuery(params: { id: string }) {
  const result = await db
    .select()
    .from(budget_table)
    .where(eq(budget_table.id, params.id));

  return result[0];
}
