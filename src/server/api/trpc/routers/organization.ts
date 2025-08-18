import { headers } from "next/headers";
import { createOrganization } from "~/server/services/organization-service";
import { updateUser } from "~/server/services/user-service";
import { auth } from "~/shared/helpers/better-auth/auth";
import {
  createOrganizationSchema,
  setActiveOrganizationSchema,
} from "~/shared/validators/organization.schema";

import { createTRPCRouter, protectedProcedure } from "../init";

export const organizationRouter = createTRPCRouter({
  // current: protectedProcedure.query(async ({ ctx: { db, orgId } }) => {
  //   return getTeamById(db, orgId);
  // }),

  // update: protectedProcedure
  //   .input(updateTeamByIdSchema)
  //   .mutation(async ({ ctx: { db, teamId }, input }) => {
  //     return updateTeamById(db, {
  //       id: teamId!,
  //       data: input,
  //     });
  //   }),

  // members: protectedProcedure.query(async ({ ctx: { db, teamId } }) => {
  //   return getTeamMembers(db, teamId);
  // }),

  list: protectedProcedure.query(async () => {
    return await auth.api.listOrganizations({
      headers: await headers(),
    });
  }),

  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      return createOrganization(db, input, session!.userId);
    }),

  setActive: protectedProcedure
    .input(setActiveOrganizationSchema)
    .mutation(async ({ ctx: { db, session }, input }) => {
      const userId = session!.userId;
      await updateUser(
        db,
        { defaultOrganizationId: input.organizationId },
        userId,
      );

      await auth.api.setActiveOrganization({
        headers: await headers(),
        body: {
          organizationId: input.organizationId,
          organizationSlug: input.organizationSlug,
        },
      });
    }),

  // leave: protectedProcedure
  //   .input(leaveTeamSchema)
  //   .mutation(async ({ ctx: { db, session }, input }) => {
  //     const teamMembersData = await getTeamMembers(db, input.teamId);

  //     const currentUser = teamMembersData?.find(
  //       (member) => member.user?.id === session.user.id,
  //     );

  //     const totalOwners = teamMembersData?.filter(
  //       (member) => member.role === "owner",
  //     ).length;

  //     if (currentUser?.role === "owner" && totalOwners === 1) {
  //       throw Error("Action not allowed");
  //     }

  //     return leaveTeam(db, {
  //       userId: session.user.id,
  //       teamId: input.teamId,
  //     });
  //   }),

  // acceptInvite: protectedProcedure
  //   .input(acceptTeamInviteSchema)
  //   .mutation(async ({ ctx: { db, session }, input }) => {
  //     return acceptTeamInvite(db, {
  //       id: input.id,
  //       userId: session.user.id,
  //     });
  //   }),

  // declineInvite: protectedProcedure
  //   .input(declineTeamInviteSchema)
  //   .mutation(async ({ ctx: { db, session }, input }) => {
  //     return declineTeamInvite(db, {
  //       id: input.id,
  //       email: session.user.email!,
  //     });
  //   }),

  // delete: protectedProcedure
  //   .input(deleteTeamSchema)
  //   .mutation(async ({ ctx: { db }, input }) => {
  //     const data = await deleteTeam(db, input.teamId);

  //     if (!data) {
  //       throw new TRPCError({
  //         code: "INTERNAL_SERVER_ERROR",
  //         message: "Team not found",
  //       });
  //     }

  //     const bankConnections = await getBankConnections(db, {
  //       teamId: data.id,
  //     });

  //     if (bankConnections.length > 0) {
  //       await tasks.trigger("delete-team", {
  //         teamId: input.teamId!,
  //         connections: bankConnections.map((connection) => ({
  //           accessToken: connection.accessToken,
  //           provider: connection.provider,
  //           referenceId: connection.referenceId,
  //         })),
  //       } satisfies DeleteTeamPayload);
  //     }
  //   }),

  // deleteMember: protectedProcedure
  //   .input(deleteTeamMemberSchema)
  //   .mutation(async ({ ctx: { db }, input }) => {
  //     return deleteTeamMember(db, {
  //       teamId: input.teamId,
  //       userId: input.userId,
  //     });
  //   }),

  // updateMember: protectedProcedure
  //   .input(updateTeamMemberSchema)
  //   .mutation(async ({ ctx: { db }, input }) => {
  //     return updateTeamMember(db, input);
  //   }),

  // teamInvites: protectedProcedure.query(async ({ ctx: { db, teamId } }) => {
  //   return getTeamInvites(db, teamId);
  // }),

  invitesByEmail: protectedProcedure.query(async () => {
    return await auth.api.listUserInvitations({
      headers: await headers(),
    });
  }),

  // invite: protectedProcedure
  //   .input(inviteTeamMembersSchema)
  //   .mutation(async ({ ctx: { db, session, teamId, geo }, input }) => {
  //     const ip = geo.ip ?? "127.0.0.1";

  //     const data = await createTeamInvites(db, {
  //       teamId: teamId!,
  //       invites: input.map((invite) => ({
  //         ...invite,
  //         invitedBy: session.user.id,
  //       })),
  //     });

  //     const invites =
  //       data?.map((invite) => ({
  //         email: invite?.email!,
  //         invitedBy: session.user.id!,
  //         invitedByName: session.user.full_name!,
  //         invitedByEmail: session.user.email!,
  //         teamName: invite?.team?.name!,
  //         inviteCode: invite?.code!,
  //       })) ?? [];

  //     await tasks.trigger("invite-team-members", {
  //       teamId: teamId!,
  //       invites,
  //       ip,
  //       locale: "en",
  //     } satisfies InviteTeamMembersPayload);
  //   }),

  // deleteInvite: protectedProcedure
  //   .input(deleteTeamInviteSchema)
  //   .mutation(async ({ ctx: { db, teamId }, input }) => {
  //     return deleteTeamInvite(db, {
  //       teamId: teamId!,
  //       id: input.id,
  //     });
  //   }),

  // availablePlans: protectedProcedure.query(async ({ ctx: { db, teamId } }) => {
  //   return getAvailablePlans(db, teamId);
  // }),

  // updateBaseCurrency: protectedProcedure
  //   .input(updateBaseCurrencySchema)
  //   .mutation(async ({ ctx: { teamId }, input }) => {
  //     const event = await tasks.trigger("update-base-currency", {
  //       teamId: teamId!,
  //       baseCurrency: input.baseCurrency,
  //     } satisfies UpdateBaseCurrencyPayload);

  //     return event;
  //   }),
});
