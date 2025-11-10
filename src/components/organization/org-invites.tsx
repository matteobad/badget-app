"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";

import { TeamInvite } from "./team-invite";

export function OrganizationInvites() {
  const trpc = useTRPC();
  const { data: invites } = useSuspenseQuery(
    trpc.organization.invitesByEmail.queryOptions(),
  );

  return (
    <div className="mt-4">
      <span className="mb-4 font-mono text-sm text-[#878787]">Invitations</span>

      <div className="mt-6 space-y-4">
        {invites.map((invite) => (
          <TeamInvite key={invite.id} invite={invite} />
        ))}
      </div>
    </div>
  );
}
