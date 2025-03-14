"server-only";

import { eq, isNull, or } from "drizzle-orm";

import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { tag_table } from "~/server/db/schema/transactions";

export const getCategories_QUERY = (userId: string) => {
  return db
    .select()
    .from(category_table)
    .where(or(eq(category_table.userId, userId), isNull(category_table.userId)))
    .orderBy(category_table.name);
};

export const getTags_QUERY = (userId: string) => {
  return db
    .select()
    .from(tag_table)
    .where(eq(tag_table.userId, userId))
    .orderBy(tag_table.text);
};
