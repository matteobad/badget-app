import type { Metadata } from "next";
import { DeleteSpace } from "~/components/space/delete-space";
import { SpaceCountry } from "~/components/space/space-country";
import { SpaceEmail } from "~/components/space/space-email";
import { SpaceLogo } from "~/components/space/space-logo";
import { SpaceName } from "~/components/space/space-name";
import { prefetch, trpc } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Space Settings | Badget",
};

export default async function Account() {
  prefetch(trpc.organization.current.queryOptions());

  return (
    <div className="space-y-6">
      <SpaceLogo />
      <SpaceName />
      <SpaceEmail />
      <SpaceCountry />
      <DeleteSpace />
    </div>
  );
}
