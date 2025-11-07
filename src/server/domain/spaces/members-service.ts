import type z from "zod";
import { auth } from "~/shared/helpers/better-auth/auth";
import type {
  removeMemberSchema,
  updateMemberRoleSchema,
} from "~/shared/validators/space.schema";

export async function getSpaceMembers(
  headers: Headers,
  organizationId: string,
) {
  const data = await auth.api.listMembers({
    headers,
    query: {
      organizationId,
      limit: 100,
      offset: 0,
    },
  });
  return data;
}

export async function removeMember(
  params: z.infer<typeof removeMemberSchema>,
  organizationId: string,
) {
  const data = await auth.api.removeMember({
    body: {
      memberIdOrEmail: params.memberIdOrEmail, // required
      organizationId,
    },
  });

  return data;
}

export async function updateMemberRole(
  params: z.infer<typeof updateMemberRoleSchema>,
  organizationId: string,
) {
  await auth.api.updateMemberRole({
    body: {
      role: params.role, // required
      memberId: params.memberId, // required
      organizationId,
    },
  });
}

export async function leaveSpace(headers: Headers, organizationId: string) {
  await auth.api.leaveOrganization({
    body: {
      organizationId, // required
    },
    // This endpoint requires session cookies.
    headers,
  });
}
