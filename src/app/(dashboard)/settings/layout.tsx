import { type Metadata } from "next";

import { SiteFooter } from "../../_components/footer";
import { SettingsTopbarNav } from "./_components/topbar-nav";

export const metadata: Metadata = {
  title: "Forms",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Collegamenti",
    href: "/settings/accounts",
  },
  {
    title: "Categorie",
    href: "/settings/categories",
  },
  {
    title: "Works",
    href: "/settings/work",
  },
  {
    title: "Appearance",
    href: "/account/settings/appearance",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="p-6">
      <SettingsTopbarNav items={sidebarNavItems} />
      <div className="hidden min-h-[calc(100vh-134px)] flex-col space-y-6 py-6 md:flex">
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
