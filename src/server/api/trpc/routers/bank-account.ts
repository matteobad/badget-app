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
      const orgId = ctx.orgId!;
      return await getBankAccounts(input, orgId);
    }),

  getById: protectedProcedure
    .input(getBankAccountByIdSchema)
    .query(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return await getBankAccountById(input, orgId);
    }),

  create: protectedProcedure
    .input(createBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return createBankAccount(input, orgId);
    }),

  update: protectedProcedure
    .input(updateBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return updateBankAccount(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteBankAccountSchema)
    .mutation(async ({ input, ctx }) => {
      const orgId = ctx.orgId!;
      return deleteBankAccount(input, orgId);
    }),
});
