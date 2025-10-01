import {
  getFinanancialMetrics,
  getHero,
} from "~/server/services/metrics-service";
import { getAssetsSchema } from "~/shared/validators/metrics.schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../init";

export const metricsRouter = createTRPCRouter({
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

  hero: publicProcedure.query(async ({ ctx: { db } }) => {
    return await getHero(db);
  }),
});
