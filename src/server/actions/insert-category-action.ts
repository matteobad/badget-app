"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { authActionClient } from "~/lib/safe-action";
import {
  deleteCategorySchema,
  updateCategorySchema,
  upsertCategoryBudgetSchema,
  upsertCategoryBulkSchema,
  upsertCategorySchema,
} from "~/lib/validators";
import {
  deleteCategory,
  editCategory,
  insertCategory,
  upsertCategoryBudget,
  upsertCategoryBulk,
} from "../db/mutations";

export const insertCategoryAction = authActionClient
  .schema(upsertCategorySchema)
  .metadata({ actionName: "insertCategoryAction" })
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

export const upsertCategoryBulkAction = authActionClient
  .schema(upsertCategoryBulkSchema)
  .metadata({ actionName: "upsert-category-bulk" })
  .action(async ({ parsedInput: { categories }, ctx: { userId } }) => {
    const result = await upsertCategoryBulk({
      categories: categories.map((c) => ({
        ...c,
        userId,
      })),
    });

    revalidateTag(`bank_categories_${userId}`);
    return result;
  });

export const editCategoryAction = authActionClient
  .schema(updateCategorySchema)
  .metadata({ actionName: "editCategoryAction" })
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
  .metadata({ actionName: "upsertCategoryBudgetAction" })
  .action(async ({ parsedInput: { budgets }, ctx: { userId } }) => {
    await upsertCategoryBudget({
      budgets,
      userId: userId,
    });

    revalidateTag(`bank_categories_${userId}`);
  });

export const deleteCategoryAction = authActionClient
  .schema(deleteCategorySchema)
  .metadata({ actionName: "deleteCategoryAction" })
  .action(async ({ parsedInput: { categoryId }, ctx: { userId } }) => {
    await deleteCategory({
      categoryId,
      userId,
    });

    revalidateTag(`category_${userId}`);
    revalidateTag(`category_rules_${userId}`);

    // TODO: move redirect to client success
    // to enable return and log of data
    redirect("/settings/categories");
  });
