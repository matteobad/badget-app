import { z } from "@hono/zod-openapi";

// Memebers
export const removeMemberSchema = z.object({
  memberIdOrEmail: z.string(),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["member", "admin", "owner"]),
  memberId: z.uuid(),
  spaceId: z.uuid().optional(),
});

// Invitations
export const createInvitationSchema = z.object({
  email: z.email(),
  role: z.enum(["member", "admin", "owner"]),
});

export const cancelInvitationSchema = z.object({
  invitationId: z.string(),
});
