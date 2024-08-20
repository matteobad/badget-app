"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { deleteCategorySchema, upsertCategorySchema } from "~/lib/validators";
import { deleteCategory, insertCategory } from "../db/mutations";

export const insertCategoryAction = authActionClient
  .schema(upsertCategorySchema)
  .action(
    async ({
      parsedInput: { name, macro, type, budgets, icon, color },
      ctx: { userId },
    }) => {
      await insertCategory({
        name,
        macro,
        type,
        userId: userId,
        budgets,
        icon,
        color,
      });

      revalidateTag(`bank_categories_${userId}`);
    },
  );

export const deleteCategoryAction = authActionClient
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput: { categoryId }, ctx: { userId } }) => {
    await deleteCategory({
      categoryId: Number(categoryId),
      userId,
    });

    revalidateTag(`bank_categories_${userId}`);
  });
