import {
  assignAccountToGroup,
  getPreferences,
  listAccountGroups,
  updateAccountGroups,
  updatePreferences,
} from "~/server/services/preferences-service";
import {
  assignAccountToGroupSchema,
  updateAccountGroupsSchema,
  updatePreferencesSchema,
} from "~/shared/validators/preferences.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const preferencesRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx: { db, orgId } }) => {
    return getPreferences(db, orgId!);
  }),

  update: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updatePreferences(db, orgId!, input);
    }),

  listAccountGroups: protectedProcedure.query(
    async ({ ctx: { db, orgId } }) => {
      return listAccountGroups(db, orgId!);
    },
  ),

  updateAccountGroups: protectedProcedure
    .input(updateAccountGroupsSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return updateAccountGroups(db, orgId!, input.groups);
    }),

  assignAccountToGroup: protectedProcedure
    .input(assignAccountToGroupSchema)
    .mutation(async ({ ctx: { db, orgId }, input }) => {
      return assignAccountToGroup(db, orgId!, input.accountId, input.groupId);
    }),
});
