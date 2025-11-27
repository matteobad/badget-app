import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "~/components/auth/sign-up-form";
import { auth } from "~/shared/helpers/better-auth/auth";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Signup | Badget.",
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return redirect("/overview");

  const t = await getScopedI18n("auth");

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-2 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          New here? Register an account to continue
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        {/* Primary Sign In Option */}
        <SignUpForm />
      </div>

      {/* Sign-in Options */}
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          {t("already_have_account")}{" "}
          <Link href="/sign-in" className="text-primary underline">
            {t("signin.submit_btn")}
          </Link>
        </span>
      </div>
    </div>
  );
}
