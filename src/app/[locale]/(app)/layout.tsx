import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ExportStatus } from "~/components/export-status";
import { GlobalSheets } from "~/components/global-sheets";
import { Header } from "~/components/layouts/header";
import { Sidebar } from "~/components/sidebar/sidebar";
import { TimezoneDetector } from "~/components/timezone-detector";
import {
  getCountryCode,
  getCurrency,
} from "~/server/services/location-service";
import {
  batchPrefetch,
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";

export default async function AppLayout(props: PropsWithChildren) {
  const queryClient = getQueryClient();
  const currencyPromise = getCurrency();
  const countryCodePromise = getCountryCode();

  // NOTE: These are used in the global sheets
  batchPrefetch([
    // trpc.space.current.queryOptions(),
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

        <div className="pb-8 md:ml-[70px]">
          <Header />

          {props.children}
        </div>

        <ExportStatus />

        <Suspense>
          {/* Global Sheets here */}
          <GlobalSheets
            currencyPromise={currencyPromise}
            countryCodePromise={countryCodePromise}
          />
        </Suspense>

        <TimezoneDetector />
      </div>
    </HydrateClient>
  );
}
