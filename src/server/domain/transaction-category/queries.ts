"server-only";

import type { DBClient } from "~/server/db";
import { transaction_category_table } from "~/server/db/schema/transactions";
import { and, asc, desc, eq, isNull } from "drizzle-orm";

export type GetTransactionCategoriesParams = {
  organizationId: string;
};

export const getTransactionCategoriesQuery = async (
  db: DBClient,
  params: GetTransactionCategoriesParams,
) => {
  const { organizationId } = params;

  return await db
    .select({
      id: transaction_category_table.id,
      name: transaction_category_table.name,
      color: transaction_category_table.color,
      icon: transaction_category_table.icon,
      slug: transaction_category_table.slug,
      description: transaction_category_table.description,
      parentId: transaction_category_table.parentId,
      system: transaction_category_table.system,
      excludeFromAnalytics: transaction_category_table.excludeFromAnalytics,
    })
    .from(transaction_category_table)
    .where(
      and(
        eq(transaction_category_table.organizationId, organizationId),
        isNull(transaction_category_table.deletedAt),
      ),
    )
    .orderBy(
      desc(transaction_category_table.createdAt),
      asc(transaction_category_table.name),
    );
};

export type GetTransactionCategoryParams = {
  id: string;
  organizationId: string;
};

export async function getTransactionCategoryQuery(
  db: DBClient,
  params: GetTransactionCategoryParams,
) {
  const [result] = await db
    .select({
      id: transaction_category_table.id,
      name: transaction_category_table.name,
      slug: transaction_category_table.slug,
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
        eq(transaction_category_table.organizationId, params.organizationId),
      ),
    )
    .limit(1);

  return result;
}
