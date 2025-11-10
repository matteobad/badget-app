"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SubmitButton } from "~/components/submit-button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useTRPC } from "~/shared/helpers/trpc/client";

type Props = {
  invite: RouterOutput["space"]["listUserInvitations"][number];
};

export function TeamInvite({ invite }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: space } = useQuery(
    trpc.space.getSpace.queryOptions({ id: invite.organizationId }),
  );

  const updateUserMutation = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        router.push("/");
      },
    }),
  );

  const acceptInvitationMutation = useMutation(
    trpc.space.acceptInvitation.mutationOptions({
      onSuccess: (data) => {
        if (!data?.invitation.organizationId) {
          return;
        }

        // Update the user's teamId
        updateUserMutation.mutate({
          defaultOrganizationId: data.invitation.organizationId,
        });
      },
    }),
  );

  const rejectInvitationMutation = useMutation(
    trpc.space.rejectInvitation.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.space.listUserInvitations.queryKey(),
        });
      },
    }),
  );

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <Avatar className="size-8 rounded-none">
          <AvatarImage
            src={space?.logo ?? ""}
            className="rounded-none"
            width={32}
            height={32}
          />
          <AvatarFallback className="rounded-none">
            <span className="text-xs">
              {space?.name?.charAt(0)?.toUpperCase()}
            </span>
          </AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium">{space?.name}</span>
      </div>

      <div className="flex gap-2">
        <SubmitButton
          isSubmitting={acceptInvitationMutation.isPending}
          variant="outline"
          onClick={() =>
            acceptInvitationMutation.mutate({
              invitationId: invite.id,
            })
          }
        >
          Accept
        </SubmitButton>
        <SubmitButton
          isSubmitting={rejectInvitationMutation.isPending}
          variant="outline"
          onClick={() =>
            rejectInvitationMutation.mutate({
              invitationId: invite.id,
            })
          }
        >
          Decline
        </SubmitButton>
      </div>
    </div>
  );
}
