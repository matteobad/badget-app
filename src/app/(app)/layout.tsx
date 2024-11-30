import { type PropsWithChildren } from "react";

import { AppSidebar } from "~/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export default function AppLayout(props: PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{props.children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
