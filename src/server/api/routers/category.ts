import { z } from "zod";

import { getCategoriesWithBudgets_QUERY } from "~/features/category/server/queries";
import { computeBudgetOfCompetence } from "~/features/category/utils";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { BUDGET_PERIOD } from "~/server/db/schema/enum";

export const categoryRouter = createTRPCRouter({
  getCategoriesWithBudgets: protectedProcedure
    .input(
      z.object({
        from: z.date(),
        to: z.date(),
        period: z.nativeEnum(BUDGET_PERIOD),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId;
      const data = await getCategoriesWithBudgets_QUERY(userId, input);

      type QUERY_CategoryType = Omit<(typeof data)[number], "budget">;
      type CategoryWithBudgets = QUERY_CategoryType & {
        budget: number;
      };

      const dataMap = new Map<string, CategoryWithBudgets>();

      for (const item of data) {
        const { budget, ...category } = item;

        // compute budget relative to period
        const amount = computeBudgetOfCompetence(budget, input.from, input.to);

        // update budget of competence in category
        const value = dataMap.get(item.id);
        if (value) value.budget += amount;
        else dataMap.set(item.id, { ...category, budget: amount });

        // update budget of competence to hierarchy
        function updateBudgetOnParent(categoryId: string, amount: number) {
          const category = dataMap.get(categoryId);
          if (!category || !category.parentId) return;
          category.budget += amount;
          return updateBudgetOnParent(category.parentId, amount);
        }
        if (category.parentId) {
          updateBudgetOnParent(category.parentId, amount);
        }
      }

      return [...dataMap.values()];
    }),
});
