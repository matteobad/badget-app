"use server";

import { revalidateTag } from "next/cache";

import { authActionClient } from "~/lib/safe-action";
import { deleteCategorySchema, insertCategorySchema } from "~/lib/validators";
import { deleteCategory, insertCategory } from "../db/mutations";

export const insertCategoryAction = authActionClient
  .schema(insertCategorySchema)
  .action(
    async ({
      parsedInput: { name, type, period, budget, icon },
      ctx: { userId },
    }) => {
      await insertCategory({
        name,
        type,
        userId: userId,
        period,
        budget,
        icon,
      });

      revalidateTag(`bank_categories_${userId}`);
    },
  );

export const deleteCategoryAction = authActionClient
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput: { categoryId }, ctx: { userId } }) => {
    await deleteCategory({
      categoryId: Number(categoryId),
    });

    revalidateTag(`bank_categories_${userId}`);
  });
