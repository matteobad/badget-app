import {
  getRecurringEntriesByDate,
  getRecurringEntriesByRange,
} from "~/server/services/recurring-entry-service";
import {
  getRecurringEntriesByDateSchema,
  getRecurringEntriesByRangeSchema,
} from "~/shared/validators/recurring-entry.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const recurringEntryRouter = createTRPCRouter({
  byDate: protectedProcedure
    .input(getRecurringEntriesByDateSchema)
    .query(async ({ ctx: { db, orgId }, input }) => {
      return await getRecurringEntriesByDate(db, input, orgId!);
    }),

  byRange: protectedProcedure
    .input(getRecurringEntriesByRangeSchema)
    .query(async ({ input, ctx: { db, orgId } }) => {
      return await getRecurringEntriesByRange(db, input, orgId!);
    }),

  //   upsert: protectedProcedure
  //     .input(upsertTrackerEntriesSchema)
  //     .mutation(async ({ ctx: { db, orgId }, input }) => {
  //       return upsertTrackerEntries(db, {
  //         ...input,
  //         teamId: teamId!,
  //       });
  //     }),

  //   delete: protectedProcedure
  //     .input(deleteTrackerEntrySchema)
  //     .mutation(async ({ ctx: { db, orgId }, input }) => {
  //       return deleteTrackerEntry(db, {
  //         teamId: teamId!,
  //         id: input.id,
  //       });
  //     }),
});
