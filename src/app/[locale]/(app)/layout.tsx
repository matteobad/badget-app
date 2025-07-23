import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FeedbackDialog } from "~/components/feedback-dialog";
import { GlobalSheets } from "~/components/global-sheets";
import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { NavUser } from "~/components/nav-user";
import { Sidebar } from "~/components/sidebar/sidebar";
import { auth } from "~/server/auth/auth";
import { getCountryCode } from "~/server/services/location-service";
import { HydrateClient } from "~/shared/helpers/trpc/server";

export default async function AppLayout(props: PropsWithChildren) {
  const countryCodePromise = getCountryCode();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return (
    <HydrateClient>
      <div className="relative">
        <Sidebar />

        <div className="pb-8 md:ml-[70px]">
          <header className="desktop:sticky desktop:top-0 desktop:bg-background bg-opacity-70 desktop:rounded-t-[10px] sticky top-0 z-50 flex h-[70px] items-center justify-between bg-[#fff] px-6 backdrop-blur-xl backdrop-filter md:static md:m-0 md:border-b md:backdrop-blur-none md:backdrop-filter dark:bg-[#121212]">
            <DynamicBreadcrumb />
            <FeedbackDialog />
            <NavUser />
          </header>
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
