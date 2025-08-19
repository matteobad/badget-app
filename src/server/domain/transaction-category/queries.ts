"server-only";

import type { DBClient } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";

export type GetCategoriesParams = {
  orgId: string;
  limit?: number;
};

export const getTransactionCategoriesQuery = async (
  db: DBClient,
  params: GetCategoriesParams,
) => {
  const { orgId, limit = 1000 } = params;

  // First get all parent categories (categories with no parentId)
  const parentCategories = await db
    .select({
      id: category_table.id,
      name: category_table.name,
      color: category_table.color,
      icon: category_table.icon,
      slug: category_table.slug,
      description: category_table.description,
      parentId: category_table.parentId,
      type: category_table.type,
      excludeFromAnalytics: category_table.excludeFromAnalytics,
    })
    .from(category_table)
    .where(
      and(
        eq(category_table.organizationId, orgId),
        isNull(category_table.parentId),
        isNull(category_table.deletedAt),
      ),
    )
    .orderBy(desc(category_table.createdAt), asc(category_table.name))
    .limit(limit);

  // Then get all child categories for these parents
  const childCategories = await db
    .select({
      id: category_table.id,
      name: category_table.name,
      color: category_table.color,
      icon: category_table.icon,
      slug: category_table.slug,
      description: category_table.description,
      parentId: category_table.parentId,
      type: category_table.type,
      excludeFromAnalytics: category_table.excludeFromAnalytics,
    })
    .from(category_table)
    .where(
      and(
        eq(category_table.organizationId, orgId),
        isNotNull(category_table.parentId),
        isNull(category_table.deletedAt),
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
};
