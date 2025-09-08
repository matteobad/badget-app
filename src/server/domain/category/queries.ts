"server-only";

import type { DBClient } from "~/server/db";
import type { CategoryType } from "~/shared/constants/enum";
import { db } from "~/server/db";
import { transaction_category_table } from "~/server/db/schema/transactions";
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
    eq(transaction_category_table.organizationId, orgId),
    isNull(transaction_category_table.deletedAt),
  ];

  if (type) {
    where.push(eq(transaction_category_table.type, type));
  }

  // First get all categories
  const categories = await db
    .select({
      id: transaction_category_table.id,
      name: transaction_category_table.name,
      slug: transaction_category_table.slug,
      type: transaction_category_table.type,
      color: transaction_category_table.color,
      icon: transaction_category_table.icon,
      description: transaction_category_table.description,
      parentId: transaction_category_table.parentId,
      excludeFromAnalytics: transaction_category_table.excludeFromAnalytics,
    })
    .from(transaction_category_table)
    .where(and(...where))
    .orderBy(
      desc(transaction_category_table.createdAt),
      asc(transaction_category_table.name),
    )
    .limit(limit);

  return categories;
}

export async function getCategoryByIdQuery(params: {
  id: string;
  orgId: string;
}) {
  const result = await db
    .select({
      id: transaction_category_table.id,
      name: transaction_category_table.name,
      slug: transaction_category_table.slug,
      type: transaction_category_table.type,
      color: transaction_category_table.color,
      icon: transaction_category_table.icon,
      description: transaction_category_table.description,
      parentId: transaction_category_table.parentId,
      excludeFromAnalytics: transaction_category_table.excludeFromAnalytics,
      // budgets: sql<
      //   Array<{ id: string; amount: number }>
      // >`COALESCE(json_agg(DISTINCT jsonb_build_object('id', ${budget_table.id}, 'amount', ${budget_table.amount})) FILTER (WHERE ${budget_table.id} IS NOT NULL), '[]'::json)`.as(
      //   "budgets",
      // ),
    })
    .from(transaction_category_table)
    .where(
      and(
        eq(transaction_category_table.id, params.id),
        eq(transaction_category_table.organizationId, params.orgId),
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
  const parent = alias(transaction_category_table, "parent");

  const categories = await db
    .select({
      slug: transaction_category_table.slug,
      name: transaction_category_table.name,
      description: transaction_category_table.description,
      type: transaction_category_table.type,
      parentSlug: parent.slug,
    })
    .from(transaction_category_table)
    .leftJoin(parent, eq(transaction_category_table.parentId, parent.id))
    .where(
      and(
        eq(transaction_category_table.organizationId, params.organizationId),
        isNull(transaction_category_table.deletedAt),
      ),
    )
    .orderBy(
      desc(transaction_category_table.createdAt),
      asc(transaction_category_table.name),
    );

  return categories;
}
