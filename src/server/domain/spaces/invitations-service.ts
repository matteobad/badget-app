import type z from "zod";
import { auth } from "~/shared/helpers/better-auth/auth";
import type {
  cancelInvitationSchema,
  createInvitationSchema,
} from "~/shared/validators/space.schema";

export async function getSpaceInvitations(
  headers: Headers,
  organizationId: string,
) {
  const data = await auth.api.listInvitations({
    headers,
    query: {
      organizationId,
    },
  });

  return data;
}

export async function createInvitation(
  params: z.infer<typeof createInvitationSchema>,
  organizationId: string, // TODO: check permission to cancel invitation
) {
  const data = await auth.api.createInvitation({
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
