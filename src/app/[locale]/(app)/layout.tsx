import { type PropsWithChildren } from "react";

import { AppSidebar } from "~/components/app-sidebar";
import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export default function AppLayout(props: PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
          </header>
          {props.children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
