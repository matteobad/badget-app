"server-only";

import type { DBClient } from "~/server/db";
import type { CategoryType } from "~/shared/constants/enum";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

type getCategoriesQueryRequest = {
  orgId: string;
  type?: CategoryType;
  limit?: number;
};

export async function getCategoriesQuery(params: getCategoriesQueryRequest) {
  const { orgId, type, limit = 1000 } = params;

  const where = [
    eq(category_table.organizationId, orgId),
    isNull(category_table.deletedAt),
  ];

  if (type) {
    where.push(eq(category_table.type, type));
  }

  // First get all categories
  const categories = await db
    .select({
      id: category_table.id,
      name: category_table.name,
      slug: category_table.slug,
      type: category_table.type,
      color: category_table.color,
      icon: category_table.icon,
      description: category_table.description,
      parentId: category_table.parentId,
      excludeFromAnalytics: category_table.excludeFromAnalytics,
    })
    .from(category_table)
    .where(and(...where))
    .orderBy(desc(category_table.createdAt), asc(category_table.name))
    .limit(limit);

  return categories;
}

export async function getCategoryByIdQuery(params: {
  id: string;
  orgId: string;
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
      excludeFromAnalytics: category_table.excludeFromAnalytics,
      // budgets: sql<
      //   Array<{ id: string; amount: number }>
      // >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${budget_table.id}, 'amount', ${budget_table.amount})) FILTER (WHERE ${budget_table.id} IS NOT NULL), '[]'::json)`.as(
      //   "budgets",
      // ),
    })
    .from(category_table)
    .where(
      and(
        eq(category_table.id, params.id),
        eq(category_table.organizationId, params.orgId),
      ),
    );

  return result[0];
}

type GetCategoriesForEnrichmentParams = {
  organizationId: string;
};

export async function getCategoriesForEnrichment(
  db: DBClient,
  params: GetCategoriesForEnrichmentParams,
) {
  const parent = alias(category_table, "parent");

  const categories = await db
    .select({
      slug: category_table.slug,
      name: category_table.name,
      description: category_table.description,
      type: category_table.type,
      parentSlug: parent.slug,
    })
    .from(category_table)
    .leftJoin(parent, eq(category_table.parentId, parent.id))
    .where(
      and(
        eq(category_table.organizationId, params.organizationId),
        isNull(category_table.deletedAt),
      ),
    )
    .orderBy(desc(category_table.createdAt), asc(category_table.name));

  return categories;
}
