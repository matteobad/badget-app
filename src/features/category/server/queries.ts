"server-only";

import { eq, getTableColumns } from "drizzle-orm";

import { db } from "~/server/db";
import { budget_table } from "~/server/db/schema/budgets";
import { category_table } from "~/server/db/schema/categories";
import { tag_table } from "~/server/db/schema/transactions";

export const getCategories_QUERY = (userId: string) => {
  return db
    .select()
    .from(category_table)
    .where(eq(category_table.userId, userId))
    .orderBy(category_table.name);
};

export const getCategoriesWithBudgets_QUERY = (userId: string) => {
  return db
    .select({
      ...getTableColumns(category_table),
      budgets: getTableColumns(budget_table),
    })
    .from(category_table)
    .leftJoin(budget_table, eq(budget_table.categoryId, category_table.id))
    .where(eq(category_table.userId, userId))
    .orderBy(category_table.name);
};

export const getTags_QUERY = (userId: string) => {
  return db
    .select()
    .from(tag_table)
    .where(eq(tag_table.userId, userId))
    .orderBy(tag_table.text);
};
