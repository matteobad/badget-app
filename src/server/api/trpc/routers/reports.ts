import { getSavings } from "~/server/services/reports-service";
import { getIncomeAnalysisSchema } from "~/shared/validators/reports.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const reportsRouter = createTRPCRouter({
  getSavings: protectedProcedure
    .input(getIncomeAnalysisSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getSavings(db, { ...input, organizationId: orgId! });
    }),
});
