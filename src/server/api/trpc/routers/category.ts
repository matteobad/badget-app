import { getCategoryByIdQuery } from "~/server/domain/category/queries";
import {
  createCategory,
  createDefaultCategories,
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
      const userId = ctx.session!.userId;
      return await getCategories(input, userId);
    }),

  getWithBudgets: protectedProcedure
    .input(getCategoriesWithBudgetsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getCategoriesWithBudgets(input, userId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getCategoryByIdQuery({ ...input, userId });
    }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await createCategory(input, userId);
    }),

  createDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session!.userId;
    return await createDefaultCategories(userId);
  }),

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await updateCategory(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await deleteCategory(input, userId);
    }),
});
