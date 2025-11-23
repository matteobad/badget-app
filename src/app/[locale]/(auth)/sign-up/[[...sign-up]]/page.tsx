import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "~/components/auth/sign-up-form";
import { auth } from "~/shared/helpers/better-auth/auth";

export const metadata: Metadata = {
  title: "Signup | Badget.",
};

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) return redirect("/overview");

  return (
    <div className="p-2">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-4 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          New here? Register an account to continue
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        {/* Primary Sign In Option */}
        <div className="space-y-3">
          <SignUpForm />
        </div>
        <div className="flex items-center justify-center">
          <span className="text-sm text-[#878787]">Or</span>
        </div>
        {/* Sign-in Options */}
        <Link
          href="/sign-in"
          className="ml-auto inline-block w-full text-center text-sm underline"
        >
          Go to Sign-in
        </Link>
      </div>
    </div>
  );
}
