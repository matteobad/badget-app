"server-only";

import type { getCategoriesSchema } from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, asc, desc, eq } from "drizzle-orm";

export async function getCategoriesQuery(
  params: z.infer<typeof getCategoriesSchema>,
  userId: string,
) {
  const { type, limit = 1000 } = params;

  const where = [eq(category_table.userId, userId)];

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
    })
    .from(category_table)
    .where(and(...where))
    .orderBy(desc(category_table.createdAt), asc(category_table.name))
    .limit(limit);

  return categories;
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
        eq(category_table.userId, params.userId),
      ),
    );

  return result[0];
}
