"server-only";

import { db } from "~/server/db";
import { budget_instances, budget_table } from "~/server/db/schema/budgets";
import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";

type GetBudgetsQueryRequest = {
  userId: string;
  from?: Date;
  to?: Date;
};

export const getMaterializedBudgetsQuery = (params: GetBudgetsQueryRequest) => {
  const where = [eq(budget_instances.userId, params.userId)];

  if (params.from && params.to) {
    // Intersect if instanceTo >= from AND instanceFrom <= to
    where.push(
      gte(budget_instances.instanceTo, params.from),
      lte(budget_instances.instanceFrom, params.to),
    );
  } else if (params.from) {
    where.push(gte(budget_instances.instanceTo, params.from));
  } else if (params.to) {
    where.push(lte(budget_instances.instanceFrom, params.to));
  }

  return db
    .select({
      id: budget_instances.id,
      categoryId: budget_instances.categoryId,
      amount: budget_instances.amount,
      from: budget_instances.instanceFrom,
      to: budget_instances.instanceTo,
      originalBudgetId: budget_instances.originalBudgetId,
    })
    .from(budget_instances)
    .where(and(...where));
};

export const getBudgetsQuery = (params: GetBudgetsQueryRequest) => {
  const where = [eq(budget_table.userId, params.userId)];

  if (params?.from && params.to) {
    where.push(
      sql`${budget_table.validity} && tstzrange(${params.from.toISOString()}, ${params.to.toISOString()}, '[]')`,
    );
  }

  where.push(isNull(budget_table.deletedAt));

  return db
    .select({
      id: budget_table.id,
      categoryId: budget_table.categoryId,
      amount: budget_table.amount,
      recurrence: budget_table.recurrence,
      from: sql<Date>`lower(${budget_table.validity})`
        .mapWith({
          mapFromDriverValue: (value: string) => {
            return new Date(value);
          },
        })
        .as("from"),
      to: sql<Date | null>`upper(${budget_table.validity})`
        .mapWith({
          mapFromDriverValue: (value: string | null) => {
            return value ? new Date(value) : null;
          },
        })
        .as("to"),
    })
    .from(budget_table)
    .where(and(...where));
};

export async function getBudgetByIdQuery(params: { id: string }) {
  const result = await db
    .select({
      id: budget_table.id,
      categoryId: budget_table.categoryId,
      amount: budget_table.amount,
      recurrence: budget_table.recurrence,
      recurrenceEnd: budget_table.recurrenceEnd,
      from: sql<Date>`lower(${budget_table.validity})`
        .mapWith({
          mapFromDriverValue: (value: string) => {
            return new Date(value);
          },
        })
        .as("from"),
      to: sql<Date | null>`upper(${budget_table.validity})`
        .mapWith({
          mapFromDriverValue: (value: string) => {
            return new Date(value);
          },
        })
        .as("to"),
    })
    .from(budget_table)
    .where(eq(budget_table.id, params.id));

  return result[0];
}
