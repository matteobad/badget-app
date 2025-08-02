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
      const orgId = ctx.orgId!;
      return await getCategories(input, orgId);
    }),

  getWithBudgets: protectedProcedure
    .input(getCategoriesWithBudgetsSchema)
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getCategoriesWithBudgets(input, orgId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getCategoryByIdQuery({ ...input, orgId });
    }),

  create: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await createCategory(input, orgId);
    }),

  createDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const orgId = ctx.orgId!;
    return await createDefaultCategories(orgId);
  }),

  update: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await updateCategory(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteCategory(input, orgId);
    }),
});
