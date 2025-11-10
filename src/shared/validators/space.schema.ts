import { z } from "@hono/zod-openapi";

// Spaces
export const getSpaceSchema = z.object({
  id: z.string(),
});

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
export const getUserInvitationsSchema = z.object({
  email: z.email(),
});

export const getInvitationSchema = z.object({
  id: z.string(),
});

export const createInvitationSchema = z.object({
  email: z.email(),
  role: z.enum(["member", "admin", "owner"]),
});

export const createInvitationsSchema = z.array(createInvitationSchema);

export const cancelInvitationSchema = z.object({
  invitationId: z.string(),
});

export const acceptInvitationSchema = z.object({
  invitationId: z.string(),
});

export const rejectInvitationSchema = z.object({
  invitationId: z.string(),
});
