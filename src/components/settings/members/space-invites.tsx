"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useUserQuery } from "~/hooks/use-user";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { TeamInvite } from "./space-invite";

export function TeamInvites() {
  const trpc = useTRPC();

  const { data: user } = useUserQuery();

  const { data: invites } = useSuspenseQuery(
    trpc.space.listUserInvitations.queryOptions(
      { email: user!.email },
      { enabled: !!user },
    ),
  );

  return (
    <div className="mt-4">
      <span className="text-sm font-mono text-[#878787] mb-4">Invitations</span>

      <div className="mt-6 space-y-4">
        {invites.map((invite) => (
          <TeamInvite key={invite.id} invite={invite} />
        ))}
      </div>
    </div>
  );
}
