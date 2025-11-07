import type { Metadata } from "next";
import { TeamMembers } from "~/components/settings/members/space-members";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Members | Badget",
};

export default function Members() {
  prefetch(trpc.space.listMembers.queryOptions());
  prefetch(trpc.space.listInvitations.queryOptions());

  return <TeamMembers />;
}
