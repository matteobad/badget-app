import { getBudgetsQuery } from "~/server/domain/budget/queries";
import { getTransactionCategoriesQuery } from "~/server/domain/transaction-category/queries";
import {
  createBudget,
  deleteBudget,
  findBudgetWarnings,
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
      const orgId = ctx.orgId!;
      const { budgetFilters } = input;

      const categories = await getTransactionCategoriesQuery(ctx.db, {
        organizationId: orgId,
      });
      const budgets = await getBudgetsQuery({ ...budgetFilters, orgId });
      return findBudgetWarnings(categories, budgets, budgetFilters);
    }),

  get: protectedProcedure
    .input(getBudgetsSchema)
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getBudgets(input, orgId);
    }),

  create: protectedProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await createBudget(input, orgId);
    }),

  update: protectedProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await updateBudget(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteBudget(input, orgId);
    }),
});
