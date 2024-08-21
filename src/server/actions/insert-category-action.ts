"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { authActionClient } from "~/lib/safe-action";
import {
  deleteCategorySchema,
  updateCategorySchema,
  upsertCategoryBudgetSchema,
  upsertCategorySchema,
} from "~/lib/validators";
import {
  deleteCategory,
  editCategory,
  insertCategory,
  upsertCategoryBudget,
} from "../db/mutations";

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

export const editCategoryAction = authActionClient
  .schema(updateCategorySchema)
  .action(
    async ({
      parsedInput: { id, name, macro, type, icon, color },
      ctx: { userId },
    }) => {
      await editCategory({
        id,
        name,
        icon,
        color,
        macro,
        type,
        userId: userId,
      });

      revalidateTag(`bank_categories_${userId}`);
    },
  );

export const upsertCategoryBudgetAction = authActionClient
  .schema(upsertCategoryBudgetSchema)
  .action(async ({ parsedInput: { budgets }, ctx: { userId } }) => {
    await upsertCategoryBudget({
      budgets,
      userId: userId,
    });

    revalidateTag(`bank_categories_${userId}`);
  });

export const deleteCategoryAction = authActionClient
  .schema(deleteCategorySchema)
  .action(async ({ parsedInput: { categoryId, name }, ctx: { userId } }) => {
    await deleteCategory({
      categoryId: Number(categoryId),
      name,
      userId,
    });

    revalidateTag(`bank_categories_${userId}`);
    redirect("/settings/categories");
  });
