"server-only";

import type { getCategoriesSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";

export async function getCategoriesQuery(
  params: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  const { limit = 1000 } = params;

  // First get all parent categories (categories with no parentId)
  const parentCategories = await db
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
    .where(
      and(eq(category_table.userId, userId), isNull(category_table.parentId)),
    )
    .orderBy(desc(category_table.createdAt), asc(category_table.name))
    .limit(limit);

  // Then get all child categories for these parents
  const childCategories = await db
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
    .where(
      and(
        eq(category_table.userId, userId),
        isNotNull(category_table.parentId),
      ),
    )
    .orderBy(asc(category_table.name));

  // Group children by parentId for efficient lookup
  const childrenByParentId = new Map<string, typeof childCategories>();
  for (const child of childCategories) {
    if (child.parentId) {
      if (!childrenByParentId.has(child.parentId)) {
        childrenByParentId.set(child.parentId, []);
      }
      childrenByParentId.get(child.parentId)!.push(child);
    }
  }

  // Attach children to their parents
  return parentCategories.map((parent) => ({
    ...parent,
    children: childrenByParentId.get(parent.id) ?? [],
  }));
}

export async function getCategoriesQuery_v1(
  params: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  const where = [eq(category_table.userId, userId)];

  return await db
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

export async function getCategoryByIdQuery(params: {
  id: string;
  userId: string;
}) {
  const result = await db
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
    .where(
      and(
        eq(category_table.id, params.id),
        // eq(category_table.userId, params.userId),
      ),
    );

  return result[0];
}
