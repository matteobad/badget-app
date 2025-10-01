import { SecondaryMenu } from "~/components/layouts/secondary-menu";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[800px] py-6">
      <SecondaryMenu
        items={[
          { path: "/account", label: "General" },
          { path: "/account/date-and-locale", label: "Date & Locale" },
          { path: "/account/security", label: "Security" },
          { path: "/account/spaces", label: "Spaces" },
          { path: "/account/support", label: "Support" },
        ]}
      />

      <main className="mt-8">{children}</main>
    </div>
  );
}
