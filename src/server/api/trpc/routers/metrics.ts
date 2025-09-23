import {
  getExpenses,
  getFinanancialMetrics,
  getHero,
  getNetWorth,
  getSpending,
} from "~/server/services/metrics-service";
import {
  getAssetsSchema,
  getExpensesSchema,
  getNetWorthSchema,
  getSpendingSchema,
} from "~/shared/validators/metrics.schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const metricsRouter = createTRPCRouter({
  expense: protectedProcedure
    .input(getExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getExpenses(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  netWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getNetWorth(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  financialMetrics: protectedProcedure
    .input(getAssetsSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getFinanancialMetrics(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  spending: protectedProcedure
    .input(getSpendingSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getSpending(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  hero: publicProcedure.query(async ({ ctx: { db } }) => {
    return await getHero(db);
  }),
});
