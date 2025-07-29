import { getExpenses } from "~/server/services/metrics-service";
import { getExpensesSchema } from "~/shared/validators/metrics.schema";

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
});
