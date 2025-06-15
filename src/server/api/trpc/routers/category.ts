import { buildCategoryTree } from "~/server/domain/category/helpers";
import { getCategoriesWithBudgets } from "~/server/services/category-service";
import { budgetFilterSchema } from "~/shared/validators/budget.schema";
import { categoryFilterSchema } from "~/shared/validators/category.schema";
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
      const categoriesWithBudgets = await getCategoriesWithBudgets(
        input.categoryFilters,
        input.budgetFilters,
        ctx.session.userId!,
      );

      return buildCategoryTree(categoriesWithBudgets);
    }),
});
