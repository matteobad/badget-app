import { SiteFooter } from "../_components/footer";
import { TopbarNav } from "../_components/topbar-nav";
import { Sidebar } from "./_components/sidebar";
import { SidebarAccounts } from "./_components/sidebar-accounts";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden rounded-[0.5rem]">
      <TopbarNav />
      <div className="flex">
        <nav className="flex w-[250px] flex-col gap-2 py-4">
          <Sidebar />
          <SidebarAccounts />
        </nav>
        <main className="grow">{props.children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
