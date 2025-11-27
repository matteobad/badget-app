import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PasskeyButton } from "~/components/auth/passkey-button";
import { SignInForm } from "~/components/auth/sign-in-form";
import { auth } from "~/shared/helpers/better-auth/auth";
import { getScopedI18n } from "~/shared/locales/server";

export const metadata: Metadata = {
  title: "Login | Badget.",
};

export default async function SignIn() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return redirect("/overview");

  const t = await getScopedI18n("auth");

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-2 font-serif text-lg">{t("signin.title")}</h1>
        <p className="mb-8 text-sm text-[#878787]">{t("signin.subtitle")}</p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        <SignInForm />
        <PasskeyButton />
      </div>

      {/* Sign-up Option */}
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          {t("no_account")}{" "}
          <Link href="/sign-up" className="text-primary underline">
            {t("signup.submit_btn")}
          </Link>
        </span>
      </div>
    </div>
  );
}
