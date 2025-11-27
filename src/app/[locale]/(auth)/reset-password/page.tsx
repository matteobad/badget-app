import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString } from "nuqs/server";
import { ResetPasswordForm } from "~/components/auth/reset-password-form";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Reset Password | Badget.",
};

// Describe your search params, and reuse this in useQueryStates / createSerializer:
const resetPasswordSearchParams = {
  token: parseAsString.withDefault(""),
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ResetPasswordPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const t = await getScopedI18n("auth.reset_password");

  const loadParams = createLoader(resetPasswordSearchParams);
  const params = loadParams(searchParams);

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-2 font-serif text-lg">{t("invalid_link_title")}</h1>
        <p className="mb-8 text-sm text-[#878787]">
          {t("invalid_link_description")}
        </p>
      </div>

      <div className="space-y-4">
        <ResetPasswordForm token={params.token} />
      </div>
    </div>
  );
}
