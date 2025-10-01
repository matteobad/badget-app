import { SecondaryMenu } from "~/components/layouts/secondary-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px] py-6">
      <SecondaryMenu
        items={[
          { path: "/settings", label: "General" },
          // { path: "/settings/billing", label: "Billing" },
          { path: "/settings/accounts", label: "Bank Connections" },
          // { path: "/settings/notifications", label: "Notifications" },
        ]}
      />

      <main className="mt-6">{children}</main>
    </div>
  );
}
