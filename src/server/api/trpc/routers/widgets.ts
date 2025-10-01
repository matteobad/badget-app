import { widgetPreferencesCache } from "~/server/cache/widget-preferences-cache";
import {
  getCombinedAccountBalance,
  getRecurringExpenses,
  getUncategorizedTransactions,
} from "~/server/services/metrics-service";
import {
  getCashFlow,
  getExpensesByCategory,
  getExpensesByMonth,
  getIncomeByMonth,
  getNetWorthTrend,
  getSavingsByMonth,
} from "~/server/services/reports-service";
import { getUncategorizedSchema } from "~/shared/validators/reports.schema";
import {
  getAccountBalancesSchema,
  getCashFlowSchema,
  getCategoryExpensesSchema,
  getMonthlyIncomeSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
  getRecurringExpensesSchema,
  getSavingAnalysisSchema,
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
      const data = await getNetWorthTrend(db, input, orgId!);

      return {
        result: data,
        toolCall: {
          toolName: "getNetWorthAnalysis",
          toolParams: {
            from: input.from,
            to: input.to,
            currency: input.currency,
            showCanvas: true,
          },
        },
      };
    }),

  getSavingAnalysis: protectedProcedure
    .input(getSavingAnalysisSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const data = await getSavingsByMonth(db, input, orgId!);

      return {
        result: data,
        // TODO: implement tool
        // toolCall: {
        //   toolName: "getSavingAnalysis",
        //   toolParams: {
        //     from: input.from,
        //     to: input.to,
        //     currency: input.currency,
        //     showCanvas: true,
        //   },
        // },
      };
    }),

  getMonthlyIncome: protectedProcedure
    .input(getMonthlyIncomeSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const income = await getIncomeByMonth(db, input, orgId!);

      return {
        result: income,
        // toolCall: {
        //   toolName: "getIncomeAnalysis",
        //   toolParams: {
        //     from: input.from,
        //     to: input.to,
        //     currency: input.currency,
        //   },
        // },
      };
    }),

  getMonthlyExpenses: protectedProcedure
    .input(getMonthlySpendingSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const spending = await getExpensesByMonth(db, input, orgId!);

      return {
        result: spending,
        // toolCall: {
        //   toolName: "getSpendingAnalysis",
        //   toolParams: {
        //     from: input.from,
        //     to: input.to,
        //     currency: input.currency,
        //   },
        // },
      };
    }),

  getCategoryExpenses: protectedProcedure
    .input(getCategoryExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const data = await getExpensesByCategory(db, input, orgId!);

      return {
        result: data,
        toolCall: {
          toolName: "getExpensesBreakdown",
          toolParams: {
            from: input.from,
            to: input.to,
            currency: input.currency,
            showCanvas: true,
          },
        },
      };
    }),

  getRecurringExpenses: protectedProcedure
    .input(getRecurringExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const recurringExpenses = await getRecurringExpenses(db, input, orgId!);

      return {
        result: recurringExpenses,
      };
    }),

  getUncategorized: protectedProcedure
    .input(getUncategorizedSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getUncategorizedTransactions(db, input, orgId!);
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
