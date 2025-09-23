import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import React from "react";
import { ResetPassword } from "~/components/auth/reset-password";
import { createLoader, parseAsString } from "nuqs/server";

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

  const loadParams = createLoader(resetPasswordSearchParams);
  const params = loadParams(searchParams);

  return (
    <div className="p-2">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="mb-4 font-serif text-lg">Welcome to Badget.</h1>
        <p className="mb-8 text-sm text-[#878787]">
          Enter your new password to reset it.
        </p>
      </div>

      {/* Sign In Options */}
      <div className="space-y-4">
        <ResetPassword token={params.token} />
      </div>
    </div>
  );
}
