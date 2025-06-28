"server-only";

import type {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, eq } from "drizzle-orm";

export async function createCategoryMutation(
  params: z.infer<typeof createCategorySchema>,
) {
  return await db.insert(category_table).values(params).returning();
}

export async function updateCategoryMutation(
  params: z.infer<typeof updateCategorySchema>,
) {
  const { id, userId, ...rest } = params;
  await db
    .update(category_table)
    .set(rest)
    .where(and(eq(category_table.id, id), eq(category_table.userId, userId!)));
}

export async function deleteCategoryMutation(
  params: z.infer<typeof deleteCategorySchema>,
) {
  const { id, userId } = params;
  await db
    .update(category_table)
    .set({ deletedAt: new Date() }) // soft delete
    .where(and(eq(category_table.id, id), eq(category_table.userId, userId)));
}
