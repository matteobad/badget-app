"use server";

import { revalidateTag } from "next/cache";
import { authActionClient } from "~/lib/safe-action";
import { db } from "~/server/db";
import { category_table } from "~/server/db/schema/categories";
import { and, eq } from "drizzle-orm";

import {
  CategoryDeleteSchema,
  CategoryInsertSchema,
  CategoryUpdateSchema,
} from "../utils/schemas";

export const createCategoryAction = authActionClient
  .schema(CategoryInsertSchema)
  .metadata({ actionName: "create-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .insert(category_table)
      .values({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Category created" };
  });

export const updateCategoryAction = authActionClient
  .schema(CategoryUpdateSchema)
  .metadata({ actionName: "update-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .update(category_table)
      .set({ ...parsedInput })
      .where(
        and(
          eq(category_table.userId, ctx.userId),
          eq(category_table.id, parsedInput.id),
        ),
      );

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Categoria aggiornata!" };
  });

export const deleteCategoryAction = authActionClient
  .schema(CategoryDeleteSchema)
  .metadata({ actionName: "delete-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db.transaction(async (tx) => {
      for (const id of parsedInput.ids) {
        await tx.delete(category_table).where(eq(category_table.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Category deleted" };
  });
