import { getCategoryByIdQuery } from "~/server/domain/category/queries";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesWithBudgets,
  updateCategory,
} from "~/server/services/category-service";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  getCategoriesWithBudgetsSchema,
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

  getWithBudgets: protectedProcedure
    .input(getCategoriesWithBudgetsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getCategoriesWithBudgets(input, userId);
    }),

  // getFlatTree: protectedProcedure
  //   .input(
  //     z.object({
  //       categoryFilters: categoryFilterSchema,
  //       budgetFilters: budgetFilterSchema,
  //     }),
  //   )
  //   .query(async ({ ctx, input }) => {
  //     const { budgetFilters } = input;

  //     const categoriesWithBudgets = await getCategoriesWithBudgets(
  //       { limit: 100 },
  //       budgetFilters,
  //       ctx.session.userId!,
  //     );

  //     const flatTreeData = buildTreeData(categoriesWithBudgets);
  //     return flatTreeData;
  //   }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
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

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await updateCategory(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await deleteCategory(input, userId);
    }),
});
