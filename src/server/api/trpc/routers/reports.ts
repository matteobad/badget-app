import {
  getCategoryExpenses,
  getIncomes,
} from "~/server/services/reports-service";
import {
  getCategoryExpensesSchema,
  getIncomesSchema,
} from "~/shared/validators/reports.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const reportsRouter = createTRPCRouter({
  getIncomes: protectedProcedure
    .input(getIncomesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getIncomes(db, { ...input, organizationId: orgId! });
    }),

  getCategoryBreakdown: protectedProcedure
    .input(getCategoryExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getCategoryExpenses(db, { ...input, organizationId: orgId! });
    }),
});
