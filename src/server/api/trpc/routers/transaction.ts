import {
  createTransaction,
  deleteTransaction,
  getTransactionAccountCounts,
  getTransactionAmountRange,
  getTransactionById,
  getTransactionCategoryCounts,
  getTransactions,
  getTransactionTagsCounts,
  updateTransaction,
} from "~/server/services/transaction-service";
import {
  createTransactionSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import { categorizeUserTransaction } from "~/utils/categorization";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getTransactions(input, userId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) })) // TODO: change to cuid2
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await getTransactionById(input.id, userId);
    }),

  getAmountRange: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId!;
    return await getTransactionAmountRange(userId);
  }),

  getCategoryCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId!;
    return await getTransactionCategoryCounts(userId);
  }),

  getTagsCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId!;
    return await getTransactionTagsCounts(userId);
  }),

  getAccountCounts: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.userId!;
    return await getTransactionAccountCounts(userId);
  }),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await createTransaction(input, userId);
    }),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await updateTransaction(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await deleteTransaction(input, userId);
    }),

  categorize: protectedProcedure
    .input(z.object({ description: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.userId!;
      return await categorizeUserTransaction(userId, input);
    }),
});
