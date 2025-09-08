import {
  createTransactionCategory,
  deleteTransactionCategory,
  getTransactionCategories,
  getTransactionCategory,
  updateTransactionCategory,
} from "~/server/services/transaction-category";
import {
  createTransactionCategorySchema,
  deleteTransactionCategorySchema,
  getTransactionCategoriesSchema,
  getTransactionCategorySchema,
  updateTransactionCategorySchema,
} from "~/shared/validators/transaction-category.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionCategoryRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTransactionCategoriesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getTransactionCategories(db, input, orgId!);
    }),

  getById: protectedProcedure
    .input(getTransactionCategorySchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getTransactionCategory(db, input, orgId!);
    }),

  create: protectedProcedure
    .input(createTransactionCategorySchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await createTransactionCategory(db, input, orgId!);
    }),

  update: protectedProcedure
    .input(updateTransactionCategorySchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await updateTransactionCategory(db, input, orgId!);
    }),

  delete: protectedProcedure
    .input(deleteTransactionCategorySchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await deleteTransactionCategory(db, input, orgId!);
    }),
});
