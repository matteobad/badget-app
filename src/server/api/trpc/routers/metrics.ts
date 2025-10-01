import { getHero } from "~/server/services/metrics-service";

import { createTRPCRouter, publicProcedure } from "../init";

export const metricsRouter = createTRPCRouter({
  hero: publicProcedure.query(async ({ ctx: { db } }) => {
    return await getHero(db);
  }),
});
