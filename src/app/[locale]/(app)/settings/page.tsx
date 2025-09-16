import type { Metadata } from "next";
import { DeleteSpace } from "~/components/space/delete-space";
import { SpaceSettings } from "~/components/space/space-settings";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Space Settings | Badget",
};

export default async function Account() {
  prefetch(trpc.organization.current.queryOptions());

  return (
    <div className="space-y-6">
      <SpaceSettings />
      <DeleteSpace />
    </div>
  );
}
