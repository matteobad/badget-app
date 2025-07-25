import {
  createBankAccount,
  deleteBankAccount,
  getBankAccountById,
  getBankAccounts,
  updateBankAccount,
} from "~/server/services/bank-account-service";
import {
  createBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountByIdSchema,
  getBankAccountsSchema,
  updateBankAccountSchema,
} from "~/shared/validators/bank-account.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const bankAccountRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getBankAccountsSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getBankAccounts(input, userId);
    }),

  getById: protectedProcedure
    .input(getBankAccountByIdSchema)
    .query(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return await getBankAccountById(input, userId);
    }),

  create: protectedProcedure
    .input(createBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return createBankAccount(input, userId);
    }),

  update: protectedProcedure
    .input(updateBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.userId;
      return updateBankAccount(input, userId);
    }),

  delete: protectedProcedure
    .input(deleteBankAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session!.userId;
      return deleteBankAccount(input, userId);
    }),
});
