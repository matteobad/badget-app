import { type PropsWithChildren } from "react";

import { AppSidebar } from "~/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { SyncActiveOrganization } from "~/utils/sync-active-organization";

export default function OrganizationLayout(props: PropsWithChildren) {
  return (
    <>
      <SyncActiveOrganization />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{props.children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
