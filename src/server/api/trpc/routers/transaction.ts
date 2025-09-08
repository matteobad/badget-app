import { getSimilarTransactions } from "~/server/domain/transaction/queries";
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
  addTransactionSplits,
  deleteTransactionSplit,
  getTransactionSplits,
} from "~/server/services/transaction-split-service";
import {
  addTransactionSplitsSchema,
  deleteTransactionSplitSchema,
  getTransactionSplitsSchema,
} from "~/shared/validators/transaction-split.schema";
import {
  createManualTransactionSchema,
  createTransferSchema,
  deleteManyTransactionsSchema,
  deleteTranferSchema,
  deleteTransactionSchema,
  getSimilarTransactionsSchema,
  getTransactionsSchema,
  updateTransactionSchema,
  updateTransactionsSchema,
} from "~/shared/validators/transaction.schema";
// import { categorizeUserTransaction } from "~/utils/categorization";
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

  getSimilarTransactions: protectedProcedure
    .input(getSimilarTransactionsSchema)
    .query(async ({ input, ctx: { db, orgId } }) => {
      return getSimilarTransactions(db, {
        name: input.name,
        categorySlug: input.categorySlug,
        frequency: input.frequency,
        organizationId: orgId!,
        transactionId: input.transactionId,
      });
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
    .input(updateTransactionsSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await updateManyTransactions(db, input, orgId!);
    }),

  deleteMany: protectedProcedure
    .input(deleteManyTransactionsSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await deleteManyTransactions(input, orgId);
    }),

  // categorize: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     const orgId = ctx.orgId!;
  //     return await categorizeUserTransaction(orgId, input);
  //   }),

  // Transaction Splits
  getSplits: protectedProcedure
    .input(getTransactionSplitsSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getTransactionSplits(db, input, orgId!);
    }),

  addSplit: protectedProcedure
    .input(addTransactionSplitsSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await addTransactionSplits(db, input, orgId!);
    }),

  deleteSplit: protectedProcedure
    .input(deleteTransactionSplitSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return await deleteTransactionSplit(db, input, orgId!);
    }),
});
