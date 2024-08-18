import { type Metadata } from "next";
import Image from "next/image";

import { Separator } from "~/components/ui/separator";
import { SiteFooter } from "../../_components/footer";
import { TopbarNav } from "../../_components/topbar-nav";
import { SidebarNav } from "./_components/sidebar-nav";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/account/profile",
  },
  {
    title: "Works",
    href: "/account/work",
  },
  {
    title: "Appearance",
    href: "/account/settings/appearance",
  },
  {
    title: "Notifications",
    href: "/account/settings/notifications",
  },
  {
    title: "Display",
    href: "/account/settings/display",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <TopbarNav />
      <div className="md:hidden">
        <Image
          src="/examples/forms-light.png"
          width={1280}
          height={791}
          alt="Forms"
          className="block dark:hidden"
        />
        <Image
          src="/examples/forms-dark.png"
          width={1280}
          height={791}
          alt="Forms"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden min-h-[calc(100vh-134px)] flex-col space-y-6 p-10 md:flex">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-1 flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
