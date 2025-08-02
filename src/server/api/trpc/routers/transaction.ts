import {
  createTransaction,
  deleteManyTransactions,
  deleteTransaction,
  getTransactionAccountCounts,
  getTransactionAmountRange,
  getTransactionById,
  getTransactionCategoryCounts,
  getTransactions,
  getTransactionTagsCounts,
  updateManyTransactions,
  updateTransaction,
} from "~/server/services/transaction-service";
import {
  createTransactionSchema,
  deleteManyTransactionsSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateManyTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import { categorizeUserTransaction } from "~/utils/categorization";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getTransactionsSchema)
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getTransactions(input, orgId);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getTransactionById(input.id, orgId);
    }),

  getAmountRange: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.orgId!;
    return await getTransactionAmountRange(orgId);
  }),

  getCategoryCounts: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.orgId!;
    return await getTransactionCategoryCounts(orgId);
  }),

  getTagsCounts: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.orgId!;
    return await getTransactionTagsCounts(orgId);
  }),

  getAccountCounts: protectedProcedure.query(async ({ ctx }) => {
    const orgId = ctx.orgId!;
    return await getTransactionAccountCounts(orgId);
  }),

  create: protectedProcedure
    .input(createTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await createTransaction(input, orgId);
    }),

  update: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await updateTransaction(input, orgId);
    }),

  updateMany: protectedProcedure
    .input(updateManyTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await updateManyTransactions(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteTransaction(input, orgId);
    }),

  deleteMany: protectedProcedure
    .input(deleteManyTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteManyTransactions(input, orgId);
    }),

  categorize: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await categorizeUserTransaction(orgId, input);
    }),
});
