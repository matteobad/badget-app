import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ForgotPassword } from "~/components/auth/forgot-password";
import { auth } from "~/shared/helpers/better-auth/auth";

export const metadata: Metadata = {
  title: "Forgot Password | Badget.",
};

export default async function ForgotPasswordPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return redirect("/overview");

  return (
    <div className="p-2">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-4 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          Forgot your password? Enter your email to reset it.
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        <ForgotPassword />
      </div>
    </div>
  );
}
