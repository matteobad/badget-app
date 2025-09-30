import {
  getNetWorth,
  getRecurring,
  getSavings,
  getUncategorized,
} from "~/server/services/reports-service";
import {
  getIncomeAnalysisSchema,
  getNetWorthSchema,
  getRecurringSchema,
  getUncategorizedSchema,
} from "~/shared/validators/reports.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const reportsRouter = createTRPCRouter({
  getSavings: protectedProcedure
    .input(getIncomeAnalysisSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getSavings(db, { ...input, organizationId: orgId! });
    }),

  getNetWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getNetWorth(db, { ...input, organizationId: orgId! });
    }),

  getRecurring: protectedProcedure
    .input(getRecurringSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getRecurring(db, { ...input, organizationId: orgId! });
    }),

  getUncategorized: protectedProcedure
    .input(getUncategorizedSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getUncategorized(db, { ...input, organizationId: orgId! });
    }),
});
