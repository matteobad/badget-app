import { getBudgetsQuery } from "~/server/domain/budget/queries";
import { getCategoriesQuery } from "~/server/domain/category/queries";
import {
  createBudget,
  findBudgetWarnings,
} from "~/server/services/budget-service";
import {
  budgetFilterSchema,
  createBudgetSchema,
} from "~/shared/validators/budget.schema";
import { categoryFilterSchema } from "~/shared/validators/category.schema";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const budgetRouter = createTRPCRouter({
  getBudgetWarnings: protectedProcedure
    .input(
      z.object({
        categoryFilters: categoryFilterSchema,
        budgetFilters: budgetFilterSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      const { categoryFilters, budgetFilters } = input;

      const categories = await getCategoriesQuery(categoryFilters, userId);
      const budgets = await getBudgetsQuery(budgetFilters, userId);
      return findBudgetWarnings(categories, budgets, budgetFilters);
    }),

  createBudget: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createBudget(input, userId);
    }),
});
