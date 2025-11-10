import type z from "zod";
import { auth } from "~/shared/helpers/better-auth/auth";
import type {
  acceptInvitationSchema,
  cancelInvitationSchema,
  createInvitationSchema,
  getInvitationSchema,
  getInvitationsSchema,
  getUserInvitationsSchema,
  rejectInvitationSchema,
} from "~/shared/validators/space.schema";

export async function getSpaceInvitations(
  headers: Headers,
  input: z.infer<typeof getInvitationsSchema>,
  organizationId: string,
) {
  let data = await auth.api.listInvitations({
    headers,
    query: {
      organizationId,
    },
  });

  if (input?.status) {
    data = data.filter((invitation) =>
      input.status?.includes(invitation.status),
    );
  }

  return data;
}

export async function getUserInvitations(
  headers: Headers,
  params: z.infer<typeof getUserInvitationsSchema>,
) {
  const data = await auth.api.listUserInvitations({
    headers,
    query: {
      email: params.email,
    },
  });

  return data;
}

export async function getInvitation(
  headers: Headers,
  params: z.infer<typeof getInvitationSchema>,
) {
  const data = await auth.api.getInvitation({
    headers,
    query: {
      id: params.id, // required
    },
  });

  return data;
}

export async function createInvitation(
  headers: Headers,
  params: z.infer<typeof createInvitationSchema>,
  organizationId: string, // TODO: check permission to cancel invitation
) {
  const data = await auth.api.createInvitation({
    headers,
    body: {
      email: params.email, // required
      role: params.role, // required
      organizationId: organizationId,
      resend: true,
    },
  });

  return data;
}

export async function cancelInvitation(
  params: z.infer<typeof cancelInvitationSchema>,
  _organizationId: string, // TODO: check permission to cancel invitation
) {
  await auth.api.cancelInvitation({
    body: {
      invitationId: params.invitationId,
    },
  });
}

export async function acceptInvitation(
  params: z.infer<typeof acceptInvitationSchema>,
  headers: Headers,
) {
  const data = await auth.api.acceptInvitation({
    headers,
    body: {
      invitationId: params.invitationId, // required
    },
  });

  return data;
}

export async function rejectInvitation(
  params: z.infer<typeof rejectInvitationSchema>,
  headers: Headers,
) {
  const data = await auth.api.rejectInvitation({
    headers,
    body: {
      invitationId: params.invitationId, // required
    },
  });

  return data;
}
