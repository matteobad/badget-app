"use server";

import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";

import { authActionClient } from "~/lib/safe-action";
import {
  CategoryDeleteSchema,
  CategoryInsertSchema,
  CategoryUpdateSchema,
  ToggleAccountSchema,
} from "~/lib/validators";
import { db } from "~/server/db";
import { MUTATIONS } from "~/server/db/queries";
import { category_table as categorySchema } from "./db/schema/categories";

export const toggleAccountAction = authActionClient
  .schema(ToggleAccountSchema)
  .metadata({ actionName: "toggle-account" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await MUTATIONS.toggleAccount({ ...parsedInput, userId: ctx.userId });

    // Invalidate cache
    revalidateTag(`connection_${ctx.userId}`);
    revalidateTag(`account_${ctx.userId}`);

    // Return success message
    return { message: "Account toggled" };
  });

export const createCategoryAction = authActionClient
  .schema(CategoryInsertSchema)
  .metadata({ actionName: "create-category" })
  .action(async ({ parsedInput, ctx }) => {
    // Mutate data
    await db
      .insert(categorySchema)
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
      .update(categorySchema)
      .set({ ...parsedInput })
      .where(
        and(
          eq(categorySchema.userId, ctx.userId),
          eq(categorySchema.id, parsedInput.id),
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
        await tx.delete(categorySchema).where(eq(categorySchema.id, id));
      }
    });

    // Invalidate cache
    revalidateTag(`category_${ctx.userId}`);

    // Return success message
    return { message: "Category deleted" };
  });
