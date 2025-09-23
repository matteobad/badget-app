import {
  getInstitutions,
  updateInstitutionUsage,
} from "~/server/services/institution-service";
import {
  getInstitutionsSchema,
  updateInstitutionUsageSchema,
} from "~/shared/validators/institution.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const institutionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(getInstitutionsSchema)
    .query(async ({ input }) => {
      return getInstitutions(input);
    }),

  updateUsage: protectedProcedure
    .input(updateInstitutionUsageSchema)
    .mutation(async ({ ctx: { db }, input }) => {
      return updateInstitutionUsage(db, input);
    }),
});
