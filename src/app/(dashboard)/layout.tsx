import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { HandCoinsIcon } from "lucide-react";

import { SiteFooter } from "~/components/footer";
import { Sidebar } from "./_components/sidebar";
import { SidebarAccounts } from "./_components/sidebar-accounts";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden rounded-[0.5rem]">
      <nav className="border-b">
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight"
          >
            <HandCoinsIcon />
            Badget.
          </Link>
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </nav>
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
