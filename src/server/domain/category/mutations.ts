"server-only";

import type { DBClient } from "~/server/db";
import type { DB_CategoryInsertType } from "~/server/db/schema/categories";
import { category_table } from "~/server/db/schema/categories";
import { and, eq } from "drizzle-orm";

export async function createCategoryMutation(
  client: DBClient,
  params: DB_CategoryInsertType,
) {
  return await client
    .insert(category_table)
    .values({ ...params })
    .onConflictDoNothing()
    .returning();
}

export async function updateCategoryMutation(
  client: DBClient,
  params: Partial<DB_CategoryInsertType>,
) {
  const { id, userId, ...rest } = params;
  return await client
    .update(category_table)
    .set(rest)
    .where(and(eq(category_table.id, id!), eq(category_table.userId, userId!)))
    .returning();
}

export async function deleteCategoryMutation(
  client: DBClient,
  params: { id: string; userId: string },
) {
  const { id, userId } = params;
  return await client
    .update(category_table)
    .set({ deletedAt: new Date().toISOString() }) // soft delete
    .where(and(eq(category_table.id, id), eq(category_table.userId, userId)));
}
