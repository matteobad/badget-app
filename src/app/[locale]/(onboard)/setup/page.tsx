import { RocketIcon } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/shared/helpers/better-auth/auth";
// import { SetupForm } from "@/components/setup-form";
import { HydrateClient } from "~/shared/helpers/trpc/server";

export const metadata: Metadata = {
  title: "Setup account | Badget.",
};

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user.id) {
    return redirect("/");
  }

  return (
    <div>
      <div className="absolute top-4 left-5 md:top-10 md:left-10">
        <Link href="/">
          <RocketIcon />
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[380px] flex-col">
          <div className="text-center">
            <h1 className="mb-2 font-serif text-lg">Update your account</h1>
            <p className="mb-8 text-sm text-[#878787]">
              Add your name and an optional avatar.
            </p>
          </div>

          <HydrateClient>
            <div />
            {/* <SetupForm /> */}
          </HydrateClient>
        </div>
      </div>
    </div>
  );
}
