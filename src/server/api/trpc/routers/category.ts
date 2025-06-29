import { buildTreeData } from "~/server/domain/category/helpers";
import {
  createCategoryMutation,
  deleteCategoryMutation,
  updateCategoryMutation,
} from "~/server/domain/category/mutations";
import { getCategoryByIdQuery } from "~/server/domain/category/queries";
import {
  createCategory,
  getCategories,
  getCategoriesWithBudgets,
} from "~/server/services/category-service";
import { budgetFilterSchema } from "~/shared/validators/budget.schema";
import {
  categoryFilterSchema,
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
} from "~/shared/validators/category.schema";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const categoryRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getCategories(input, userId);
    }),

  getFlatTree: protectedProcedure
    .input(
      z.object({
        categoryFilters: categoryFilterSchema,
        budgetFilters: budgetFilterSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const { budgetFilters } = input;

      const categoriesWithBudgets = await getCategoriesWithBudgets(
        { limit: 100 },
        budgetFilters,
        ctx.session.userId!,
      );

      const flatTreeData = buildTreeData(categoriesWithBudgets);
      return flatTreeData;
    }),

  getAll: protectedProcedure
    .input(categoryFilterSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getCategories(input, userId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) })) // TODO: change to cuid2
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getCategoryByIdQuery({ ...input, userId });
    }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createCategory(input, userId);
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
