import {
  createManualTransaction,
  createTransfer,
  deleteManyTransactions,
  deleteTransaction,
  deleteTransfer,
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
  createManualTransactionSchema,
  createTransferSchema,
  deleteManyTransactionsSchema,
  deleteTranferSchema,
  deleteTransactionSchema,
  getTransactionsSchema,
  updateManyTransactionsSchema,
  updateTransactionSchema,
} from "~/shared/validators/transaction.schema";
import { categorizeUserTransaction } from "~/utils/categorization";
import { z } from "zod/v4";

import { createTRPCRouter, protectedProcedure } from "../init";

export const transactionRouter = createTRPCRouter({
  // Transaction List Management
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

  // Transaction Filters Helpers
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

  // Manual Transaction Management
  createManualTransaction: protectedProcedure
    .input(createManualTransactionSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await createManualTransaction(db, input, orgId!);
    }),

  createTransfer: protectedProcedure
    .input(createTransferSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await createTransfer(db, input, orgId!);
    }),

  updateTransaction: protectedProcedure
    .input(updateTransactionSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await updateTransaction(db, input, orgId!);
    }),

  deleteTransaction: protectedProcedure
    .input(deleteTransactionSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await deleteTransaction(db, input, orgId!);
    }),

  deleteTransfer: protectedProcedure
    .input(deleteTranferSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await deleteTransfer(db, input, orgId!);
    }),

  // Other Transaction Management
  updateMany: protectedProcedure
    .input(updateManyTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await updateManyTransactions(input, orgId);
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
