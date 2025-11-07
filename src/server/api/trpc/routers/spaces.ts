import {
  cancelInvitation,
  createInvitation,
  getSpaceInvitations,
} from "~/server/domain/spaces/invitations-service";
import {
  getSpaceMembers,
  leaveSpace,
  removeMember,
  updateMemberRole,
} from "~/server/domain/spaces/members-service";
import {
  cancelInvitationSchema,
  createInvitationSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
} from "~/shared/validators/space.schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const spacesRouter = createTRPCRouter({
  // Members
  listMembers: protectedProcedure.query(async ({ ctx: { headers, orgId } }) => {
    return await getSpaceMembers(headers, orgId!);
  }),

  removeMember: protectedProcedure
    .input(removeMemberSchema)
    .mutation(async ({ ctx: { orgId }, input }) => {
      return await removeMember(input, orgId!);
    }),

  updateMemberRole: protectedProcedure
    .input(updateMemberRoleSchema)
    .mutation(async ({ ctx: { orgId }, input }) => {
      return await updateMemberRole(input, orgId!);
    }),

  leave: protectedProcedure.mutation(async ({ ctx: { orgId, headers } }) => {
    return await leaveSpace(headers, orgId!);
  }),

  // Invitations
  createInvitation: protectedProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx: { orgId }, input }) => {
      return await createInvitation(input, orgId!);
    }),

  listInvitations: protectedProcedure.query(
    async ({ ctx: { headers, orgId } }) => {
      return await getSpaceInvitations(headers, orgId!);
    },
  ),

  cancelInvitation: protectedProcedure
    .input(cancelInvitationSchema)
    .mutation(async ({ ctx: { orgId }, input }) => {
      return cancelInvitation(input, orgId!);
    }),
});
