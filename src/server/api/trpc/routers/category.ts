import { buildCategoryTree } from "~/server/domain/category/helpers";
import {
  createCategoryMutation,
  deleteCategoryMutation,
  updateCategoryMutation,
} from "~/server/domain/category/mutations";
import {
  enrichCategoryTree,
  getCategoriesWithBudgets,
} from "~/server/services/category-service";
import { budgetFilterSchema } from "~/shared/validators/budget.schema";
import {
  categoryFilterSchema,
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const categoryRouter = createTRPCRouter({
  getCategoryTree: protectedProcedure
    .input(
      z.object({
        categoryFilters: categoryFilterSchema,
        budgetFilters: budgetFilterSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { categoryFilters, budgetFilters } = input;

      const categoriesWithBudgets = await getCategoriesWithBudgets(
        categoryFilters,
        budgetFilters,
        ctx.session.userId!,
      );

      const categoryTree = buildCategoryTree(categoriesWithBudgets);
      const enrichedTree = enrichCategoryTree(categoryTree, budgetFilters);
      return enrichedTree;
    }),

  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createCategoryMutation({ ...input, userId });
    }),

  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await updateCategoryMutation({ ...input, userId });
    }),

  deleteCategory: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await deleteCategoryMutation({ ...input, userId });
    }),
});
