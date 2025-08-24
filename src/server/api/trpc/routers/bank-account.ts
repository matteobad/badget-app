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
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return createBankAccount(db, input, orgId!);
    }),

  update: protectedProcedure
    .input(updateBankAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const orgId = ctx.orgId!;
      return updateBankAccount(input, orgId);
    }),

  delete: protectedProcedure
    .input(deleteBankAccountSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return deleteBankAccount(db, input, orgId!);
    }),
});
