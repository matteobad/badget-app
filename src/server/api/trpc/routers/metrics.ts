import { getExpenses, getNetWorth } from "~/server/services/metrics-service";
import {
  getExpensesSchema,
  getNetWorthSchema,
} from "~/shared/validators/metrics.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const metricsRouter = createTRPCRouter({
  expense: protectedProcedure
    .input(getExpensesSchema)
    .query(async ({ ctx: { db, session }, input }) => {
      return getExpenses(db, {
        userId: session!.userId,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),

  netWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, session }, input }) => {
      return getNetWorth(db, {
        userId: session!.userId,
        from: input.from,
        to: input.to,
        currency: input.currency,
      });
    }),
});
