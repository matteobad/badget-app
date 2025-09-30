import { widgetPreferencesCache } from "~/server/cache/widget-preferences-cache";
import {
  getCashFlow,
  getCategorySpendingForPeriod,
  getCombinedAccountBalance,
  getIncomeForPeriod,
  getNetWorth,
  getRecurringForPeriod,
  getSpendingForPeriod,
} from "~/server/services/reports-service";
import {
  getAccountBalancesSchema,
  getCashFlowSchema,
  getCategoryExpensesSchema,
  getMonthlyIncomeSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
  getRecurringExpensesSchema,
  updateWidgetPreferencesSchema,
} from "~/shared/validators/widgets.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const widgetsRouter = createTRPCRouter({
  // Widgets data
  getAccountBalances: protectedProcedure
    .input(getAccountBalancesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getCombinedAccountBalance(db, input, orgId!);
    }),

  getCashFlow: protectedProcedure
    .input(getCashFlowSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getCashFlow(db, input, orgId!);
    }),

  getNetWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getNetWorth(db, {
        organizationId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  getMonthlyIncome: protectedProcedure
    .input(getMonthlyIncomeSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const income = await getIncomeForPeriod(db, input, orgId!);

      return {
        result: income,
        toolCall: {
          toolName: "getIncomeAnalysis",
          toolParams: {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
        },
      };
    }),

  getMonthlySpending: protectedProcedure
    .input(getMonthlySpendingSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const spending = await getSpendingForPeriod(db, input, orgId!);

      return {
        result: spending,
        toolCall: {
          toolName: "getSpendingAnalysis",
          toolParams: {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
        },
      };
    }),

  getCategoryExpenses: protectedProcedure
    .input(getCategoryExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const categorySpending = await getCategorySpendingForPeriod(
        db,
        input,
        orgId!,
      );

      return {
        result: categorySpending,
        toolCall: {
          toolName: "getSpendingAnalysis",
          toolParams: {
            from: input.from,
            to: input.to,
            currency: input.currency,
          },
        },
      };
    }),

  getRecurringExpenses: protectedProcedure
    .input(getRecurringExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const recurringExpenses = await getRecurringForPeriod(db, input, orgId!);

      return {
        result: recurringExpenses,
      };
    }),

  // Preferences
  getWidgetPreferences: protectedProcedure.query(
    async ({ ctx: { orgId, session } }) => {
      const preferences = await widgetPreferencesCache.getWidgetPreferences(
        orgId!,
        session!.userId,
      );
      return preferences;
    },
  ),

  updateWidgetPreferences: protectedProcedure
    .input(updateWidgetPreferencesSchema)
    .mutation(async ({ ctx: { orgId, session }, input }) => {
      const preferences = await widgetPreferencesCache.updatePrimaryWidgets(
        orgId!,
        session!.userId,
        input.primaryWidgets,
      );
      return preferences;
    }),
});
