import {
  getAssets,
  getExpenses,
  getLiabilities,
  getNetWorth,
  getSpending,
} from "~/server/services/metrics-service";
import {
  getAssetsSchema,
  getExpensesSchema,
  getLiabilitiesSchema,
  getNetWorthSchema,
  getSpendingSchema,
} from "~/shared/validators/metrics.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

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

  assets: protectedProcedure
    .input(getAssetsSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getAssets(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  liabilities: protectedProcedure
    .input(getLiabilitiesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getLiabilities(db, {
        orgId: orgId!,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),
});
