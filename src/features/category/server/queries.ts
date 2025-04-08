"server-only";

import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "~/server/db";
import { budget_table } from "~/server/db/schema/budgets";
import { category_table } from "~/server/db/schema/categories";
import { tag_table } from "~/server/db/schema/transactions";
import { type CategoriesFilterType } from "../utils/search-params";

export const getCategories_QUERY = (userId: string) => {
  return db
    .select()
    .from(category_table)
    .where(eq(category_table.userId, userId))
    .orderBy(category_table.name);
};

export const getCategoriesWithBudgets_QUERY = (
  userId: string,
  params: CategoriesFilterType,
) => {
  return db
    .select({
      id: category_table.id,
      slug: category_table.slug,
      name: category_table.name,
      description: category_table.description,
      type: category_table.type,
      color: category_table.color,
      icon: category_table.icon,
      parentId: category_table.parentId,
      budget: {
        id: budget_table.id,
        categoryId: budget_table.categoryId,
        amount: budget_table.amount,
        period: budget_table.period,
        startDate: sql<Date>`lower(${budget_table.sysPeriod})`.as("startDate"),
        endDate: sql<Date | null>`upper(${budget_table.sysPeriod})`.as(
          "endDate",
        ),
      },
    })
    .from(category_table)
    .leftJoin(
      budget_table,
      and(
        eq(budget_table.categoryId, category_table.id),
        eq(budget_table.userId, userId),
        isNull(budget_table.deletedAt),
        sql`${budget_table.sysPeriod} && tstzrange(${params.from.toISOString()}, ${params.to.toISOString()}, '[]')`,
      ),
    )
    .where(
      and(eq(category_table.userId, userId), isNull(category_table.deletedAt)),
    )
    .orderBy(category_table.name);
};

export const getBudgets_QUERY = (
  userId: string,
  params: CategoriesFilterType,
) => {
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
    .where(
      and(
        eq(budget_table.userId, userId),
        isNull(budget_table.deletedAt),
        sql`${budget_table.sysPeriod} && tstzrange(${params.from.toISOString()}, ${params.to.toISOString()}, '[]')`,
      ),
    );
};

export const getTags_QUERY = (userId: string) => {
  return db
    .select()
    .from(tag_table)
    .where(eq(tag_table.userId, userId))
    .orderBy(tag_table.text);
};
