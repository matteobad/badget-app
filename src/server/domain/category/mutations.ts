"server-only";

import type {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import type z from "zod/v4";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { eq } from "drizzle-orm";

export async function createCategoryMutation(
  params: z.infer<typeof createCategorySchema>,
) {
  await db.insert(category_table).values(params);
}

export async function updateCategoryMutation(
  params: z.infer<typeof updateCategorySchema>,
) {
  const { id, ...rest } = params;
  await db.update(category_table).set(rest).where(eq(category_table.id, id));
}

export async function deleteCategoryMutation(
  params: z.infer<typeof deleteCategorySchema>,
) {
  await db
    .update(category_table)
    .set({ deletedAt: new Date() }) // soft delete
    .where(eq(category_table.id, params.id));
}
