import {
  getCategoryExpenses,
  getIncomes,
  getMonthlySpending,
  getNetWorth,
  getUncategorized,
} from "~/server/services/reports-service";
import {
  getCategoryExpensesSchema,
  getIncomesSchema,
  getMonthlySpendingSchema,
  getNetWorthSchema,
  getUncategorizedSchema,
} from "~/shared/validators/reports.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const reportsRouter = createTRPCRouter({
  getIncomes: protectedProcedure
    .input(getIncomesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getIncomes(db, { ...input, organizationId: orgId! });
    }),

  getMonthlySpending: protectedProcedure
    .input(getMonthlySpendingSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getMonthlySpending(db, { ...input, organizationId: orgId! });
    }),

  getNetWorth: protectedProcedure
    .input(getNetWorthSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getNetWorth(db, { ...input, organizationId: orgId! });
    }),

  getCategoryExpenses: protectedProcedure
    .input(getCategoryExpensesSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getCategoryExpenses(db, { ...input, organizationId: orgId! });
    }),

  getUncategorized: protectedProcedure
    .input(getUncategorizedSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return getUncategorized(db, { ...input, organizationId: orgId! });
    }),
});
