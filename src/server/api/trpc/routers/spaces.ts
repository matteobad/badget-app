import {
  acceptInvitation,
  cancelInvitation,
  createInvitation,
  getInvitation,
  getSpaceInvitations,
  getUserInvitations,
  rejectInvitation,
} from "~/server/domain/spaces/invitations-service";
import {
  getSpaceMembers,
  leaveSpace,
  removeMember,
  updateMemberRole,
} from "~/server/domain/spaces/members-service";
import { getFullSpace, getSpace } from "~/server/domain/spaces/spaces-service";
import {
  acceptInvitationSchema,
  cancelInvitationSchema,
  createInvitationSchema,
  createInvitationsSchema,
  getInvitationSchema,
  getInvitationsSchema,
  getSpaceSchema,
  getUserInvitationsSchema,
  rejectInvitationSchema,
  removeMemberSchema,
  updateMemberRoleSchema,
} from "~/shared/validators/space.schema";
import { createTRPCRouter, protectedProcedure } from "../init";

export const spacesRouter = createTRPCRouter({
  // Spaces
  getSpace: protectedProcedure
    .input(getSpaceSchema)
    .query(async ({ ctx: { db }, input }) => {
      return await getSpace(db, input);
    }),

  getFullSpace: protectedProcedure
    .input(getSpaceSchema)
    .query(async ({ ctx: { headers }, input }) => {
      return await getFullSpace(input, headers);
    }),

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
    .mutation(async ({ ctx: { orgId, headers }, input }) => {
      return await createInvitation(headers, input, orgId!);
    }),

  createInvitations: protectedProcedure
    .input(createInvitationsSchema)
    .mutation(async ({ ctx: { orgId, headers }, input }) => {
      return await Promise.all(
        input.map((invitation) =>
          createInvitation(headers, invitation, orgId!),
        ),
      );
    }),

  listInvitations: protectedProcedure
    .input(getInvitationsSchema)
    .query(async ({ ctx: { headers, orgId }, input }) => {
      return await getSpaceInvitations(headers, input, orgId!);
    }),

  listUserInvitations: protectedProcedure
    .input(getUserInvitationsSchema)
    .query(async ({ ctx: { headers }, input }) => {
      return await getUserInvitations(headers, input);
    }),

  getInvitation: protectedProcedure
    .input(getInvitationSchema)
    .query(async ({ ctx: { headers }, input }) => {
      return await getInvitation(headers, input);
    }),

  cancelInvitation: protectedProcedure
    .input(cancelInvitationSchema)
    .mutation(async ({ ctx: { orgId }, input }) => {
      return cancelInvitation(input, orgId!);
    }),

  acceptInvitation: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return await acceptInvitation(input, headers);
    }),

  rejectInvitation: protectedProcedure
    .input(rejectInvitationSchema)
    .mutation(async ({ ctx: { headers }, input }) => {
      return rejectInvitation(input, headers);
    }),
});
