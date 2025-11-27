import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "~/components/auth/forgot-password-form";
import { auth } from "~/shared/helpers/better-auth/auth";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Forgot Password | Badget.",
};

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return redirect("/overview");

  const t = await getScopedI18n("auth.forgot_password");

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-2 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          Forgot your password? Enter your email to reset it.
        </p>
      </div>

      <div className="space-y-4">
        <ForgotPasswordForm />
      </div>

      <div className="w-full text-center text-sm">
        <span className="text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-primary underline">
            {t("back_btn")}
          </Link>
        </span>
      </div>
    </div>
  );
}
