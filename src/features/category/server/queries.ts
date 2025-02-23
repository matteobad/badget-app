"server-only";

import { eq, isNull, or } from "drizzle-orm";

import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";

export const getCategoriesForUser_QUERY = (userId: string) => {
  return db
    .select()
    .from(category_table)
    .where(or(eq(category_table.userId, userId), isNull(category_table.userId)))
    .orderBy(category_table.name);
};
