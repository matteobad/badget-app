import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
  {
    title: "Profilo",
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
    title: "Lavoro",
    href: "/settings/work",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="p-6">
      <div className="hidden min-h-[calc(100vh-134px)] flex-col space-y-6 md:flex">
        {children}
      </div>
    </div>
  );
}
