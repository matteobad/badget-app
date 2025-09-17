import type { Metadata } from "next";
import { SupportForm } from "~/components/account-settings/support/support-form";

export const metadata: Metadata = {
  title: "Support | Badget",
};

export default function Support() {
  return (
    <div className="space-y-12">
      <div className="max-w-[450px]">
        <SupportForm />
      </div>
    </div>
  );
}
