import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Advanced form example using react-hook-form and Zod.",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-70px)] flex-col space-y-6 py-6">
      {children}
    </div>
  );
}
