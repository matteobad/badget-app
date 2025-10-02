import { accountPreferencesCache } from "~/server/cache/account-preferences-cache";
import {
  createManualBankAccount,
  deleteBankAccount,
  getBankAccountById,
  getBankAccounts,
  updateBankAccount,
  updateManualBankAccountBalance,
} from "~/server/services/bank-account-service";
import {
  createManualBankAccountSchema,
  deleteBankAccountSchema,
  getBankAccountByIdSchema,
  getBankAccountsSchema,
  updateAccountPreferencesSchema,
  updateBankAccountBalanceSchema,
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
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updateBankAccount(db, input, orgId!);
    }),

  updateBankAccountBalance: protectedProcedure
    .input(updateBankAccountBalanceSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updateManualBankAccountBalance(db, input, orgId!);
    }),

  delete: protectedProcedure
    .input(deleteBankAccountSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return deleteBankAccount(db, input, orgId!);
    }),

  // Preferences
  getAccountPreferences: protectedProcedure.query(
    async ({ ctx: { orgId, session } }) => {
      const preferences = await accountPreferencesCache.getAccountPreferences(
        orgId!,
        session!.userId,
      );
      return preferences;
    },
  ),

  updateAccountPreferences: protectedProcedure
    .input(updateAccountPreferencesSchema)
    .mutation(async ({ ctx: { orgId, session }, input }) => {
      const preferences = await accountPreferencesCache.updatePrimaryWidgets(
        orgId!,
        session!.userId,
        input.primaryWidgets,
      );
      return preferences;
    }),
});
