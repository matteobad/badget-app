import type { PropsWithChildren } from "react";
import { Suspense } from "react";
import { AppSidebar } from "~/components/app-sidebar";
import { FeedbackDialog } from "~/components/feedback-dialog";
import { GlobalSheets } from "~/components/global-sheets";
import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { NavUser } from "~/components/nav-user";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { getCountryCode } from "~/server/services/location-service";

export default function AppLayout(props: PropsWithChildren) {
  const countryCodePromise = getCountryCode();

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
              <FeedbackDialog />
              <NavUser />
            </div>
          </header>
          {props.children}
        </SidebarInset>
      </SidebarProvider>

      <Suspense>
        {/* Global Sheets here */}
        <GlobalSheets countryCodePromise={countryCodePromise} />
      </Suspense>
    </>
  );
}
