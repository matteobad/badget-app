"server-only";

import type { categoryFilterSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, eq, ilike, isNotNull, isNull } from "drizzle-orm";

export async function getCategoriesQuery(
  filters: z.infer<typeof categoryFilterSchema>,
  userId: string,
) {
  const where = [eq(category_table.userId, userId)];

  if (filters?.name) {
    where.push(ilike(category_table.name, filters.name));
  }

  if (filters?.slug) {
    where.push(eq(category_table.slug, filters.slug));
  }

  if (filters?.type) {
    where.push(eq(category_table.type, filters.type));
  }

  if (filters?.deleted) {
    where.push(isNotNull(category_table.deletedAt));
  } else {
    where.push(isNull(category_table.deletedAt));
  }

  return db
    .select({
      id: category_table.id,
      name: category_table.name,
      slug: category_table.slug,
      type: category_table.type,
      color: category_table.color,
      icon: category_table.icon,
      description: category_table.description,
      parentId: category_table.parentId,
    })
    .from(category_table)
    .where(and(...where));
}

export async function getCategoryByIdQuery(params: { id: string }) {
  const result = await db
    .select()
    .from(category_table)
    .where(eq(category_table.id, params.id));

  return result[0];
}
