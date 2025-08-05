import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GlobalSheets } from "~/components/global-sheets";
import { Header } from "~/components/layouts/header";
import { Sidebar } from "~/components/sidebar/sidebar";
import { getCountryCode } from "~/server/services/location-service";
import { auth } from "~/shared/helpers/better-auth/auth";
import { HydrateClient } from "~/shared/helpers/trpc/server";

export default async function AppLayout(props: PropsWithChildren) {
  const countryCodePromise = getCountryCode();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  // if (!session.user.username) {
  //   redirect("/setup");
  // }

  if (!session.session.activeOrganizationId) {
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

        <Suspense>
          {/* Global Sheets here */}
          <GlobalSheets countryCodePromise={countryCodePromise} />
        </Suspense>
      </div>
    </HydrateClient>
  );
}
