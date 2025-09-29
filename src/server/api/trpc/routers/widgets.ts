import { widgetPreferencesCache } from "~/server/cache/widget-preferences-cache";
import { getCombinedAccountBalance } from "~/server/domain/bank-account/queries";
import { getCashFlow } from "~/server/domain/widgets/queries";
import { getNetWorth } from "~/server/services/metrics-service";
import { getSpendingForPeriod } from "~/server/services/reports-service";
import {
  getAccountBalancesSchema,
  getCashFlowSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
  updateWidgetPreferencesSchema,
} from "~/shared/validators/widgets.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const widgetsRouter = createTRPCRouter({
  // Widgets data
  getCashFlow: protectedProcedure
    .input(getCashFlowSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const cashFlowData = await getCashFlow(db, {
        organizationId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
        period: input.period,
      });

      return {
        result: {
          netCashFlow: cashFlowData.summary.netCashFlow,
          currency: cashFlowData.summary.currency,
          period: cashFlowData.summary.period,
          meta: cashFlowData.meta,
        },
      };
    }),

  getNetWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getNetWorth(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  getAccountBalances: protectedProcedure
    .input(getAccountBalancesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const accountBalances = await getCombinedAccountBalance(db, {
        organizationId: orgId!,
        currency: input.currency,
      });

      return {
        result: accountBalances,
      };
    }),

  getMonthlySpending: protectedProcedure
    .input(getMonthlySpendingSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      const spending = await getSpendingForPeriod(db, {
        organizationId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });

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
