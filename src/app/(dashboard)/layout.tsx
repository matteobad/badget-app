import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { GaugeIcon } from "lucide-react";

import { SiteFooter } from "~/components/footer";
import { Sidebar } from "./_components/sidebar";

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden rounded-[0.5rem]">
      <nav className="border-b pb-2">
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/"
            className="relative z-20 flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <GaugeIcon />
            Badget.
          </Link>
          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </nav>
      <main className="flex">
        <Sidebar className="hidden w-[250px] min-w-[250px] lg:block" />
        {props.children}
      </main>
      <SiteFooter />
    </div>
  );
}
