import { getTransactionCategoriesQuery } from "~/server/domain/transaction-category/queries";
import { getCategories } from "~/server/services/category-service";
import { getCategoriesSchema } from "~/shared/validators/category.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionCategoryRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const data = await getTransactionCategoriesQuery(db, {
        orgId: orgId!,
        limit: input?.limit,
      });

      return data;
    }),

  getAll: protectedProcedure
    .input(getCategoriesSchema)
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getCategories(
        { type: input.type, limit: input?.limit },
        orgId,
      );
    }),
});
