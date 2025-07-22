import { getCategories } from "~/server/services/category-service";
import { getCategoriesSchema } from "~/shared/validators/category.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const categoryBudgetRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getCategories(input, userId);
    }),
});
