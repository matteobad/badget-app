import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";
import { ExportStatus } from "~/components/export-status";
import { GlobalSheets } from "~/components/global-sheets";
import { Header } from "~/components/layouts/header";
import { Sidebar } from "~/components/sidebar/sidebar";
import { TimezoneDetector } from "~/components/timezone-detector";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";

export default async function AppLayout(props: PropsWithChildren) {
  const queryClient = getQueryClient();

  // NOTE: These are used in the global sheets
  batchPrefetch([
    trpc.organization.current.queryOptions(),
    trpc.search.global.queryOptions({ searchTerm: "" }),
  ]);

  // NOTE: Right now we want to fetch the user and hydrate the client
  // Next steps would be to prefetch and suspense
  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());

  if (!user) redirect("/sign-in");

  // if (!session.user.username) {
  //   redirect("/setup");
  // }

  if (!user.defaultOrganizationId) {
    redirect("/spaces");
  }

  return (
    <HydrateClient>
      <div className="relative">
        <Sidebar />

        <div className="pb-4 md:ml-[70px]">
          <Header />

          <div className="px-8">{props.children}</div>
        </div>

        <ExportStatus />

        <GlobalSheets />

        <TimezoneDetector />
      </div>
    </HydrateClient>
  );
}
