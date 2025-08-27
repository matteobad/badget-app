import {
  createManualBankAccount,
  deleteBankAccount,
  getBankAccountById,
  getBankAccounts,
  updateBankAccount,
} from "~/server/services/bank-account-service";
import {
  createManualBankAccountSchema,
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

  createManualBankAccount: protectedProcedure
    .input(createManualBankAccountSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return createManualBankAccount(db, input, orgId!);
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
