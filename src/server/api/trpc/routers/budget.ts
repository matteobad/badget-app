import { getBudgetsQuery } from "~/server/domain/budget/queries";
import { getCategoriesQuery } from "~/server/domain/category/queries";
import {
  createBudget,
  deleteBudget,
  findBudgetWarnings,
  getBudgetInstances,
  getBudgets,
  updateBudget,
} from "~/server/services/budget-service";
import {
  budgetFilterSchema,
  createBudgetSchema,
  deleteBudgetSchema,
  getBudgetsSchema,
  updateBudgetSchema,
} from "~/shared/validators/budget.schema";
import { getCategoriesSchema } from "~/shared/validators/category.schema";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const budgetRouter = createTRPCRouter({
  getBudgetWarnings: protectedProcedure
    .input(
      z.object({
        categoryFilters: getCategoriesSchema,
        budgetFilters: budgetFilterSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      const { budgetFilters } = input;

      const categories = await getCategoriesQuery({ userId });
      const budgets = await getBudgetsQuery({ ...budgetFilters, userId });
      return findBudgetWarnings(categories, budgets, budgetFilters);
    }),

  get: protectedProcedure
    .input(getBudgetsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getBudgets(input, userId);
    }),

  create: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createBudget(input, userId);
    }),

  update: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await updateBudget(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await deleteBudget(input, userId);
    }),
});
