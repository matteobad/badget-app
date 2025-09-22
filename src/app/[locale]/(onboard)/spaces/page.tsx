import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NavUser } from "~/components/nav-user";
import { OrganizationInvites } from "~/components/organization/org-invites";
import { SelectOrgTable } from "~/components/organization/select-org/table";
import { Button } from "~/components/ui/button";
import {
  getQueryClient,
  HydrateClient,
  trpc,
} from "~/shared/helpers/trpc/server";
import { RocketIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Spaces | Badget.",
};

export default async function Teams() {
  const queryClient = getQueryClient();

  const organizations = await queryClient.fetchQuery(
    trpc.organization.list.queryOptions(),
  );
  const invites = await queryClient.fetchQuery(
    trpc.organization.invitesByEmail.queryOptions(),
  );

  const user = await queryClient.fetchQuery(trpc.user.me.queryOptions());

  // If no teams and no invites, redirect to create team
  if (!organizations?.length && !invites?.length) {
    redirect("/spaces/create");
  }

  return (
    <HydrateClient>
      <header className="absolute right-0 left-0 flex w-full items-center justify-between">
        <div className="mt-4 ml-5 md:mt-10 md:ml-10">
          <Link href="/">
            <RocketIcon />
          </Link>
        </div>

        <div className="mt-4 mr-5 md:mt-10 md:mr-10">
          <NavUser />
        </div>
      </header>

      <div className="flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[480px] flex-col">
          <div>
            <div className="text-center">
              <h1 className="mb-2 font-serif text-lg">
                Welcome, {user?.displayUsername?.split(" ").at(0)}
              </h1>
              {invites?.length > 0 ? (
                <p className="mb-8 text-sm text-[#878787]">
                  Join a team you’ve been invited to or create a new one.
                </p>
              ) : (
                <p className="mb-8 text-sm text-[#878787]">
                  Select a team or create a new one.
                </p>
              )}
            </div>
          </div>

          {/* If there are organizations, show them */}
          {organizations?.length && (
            <>
              <span className="mb-4 font-mono text-sm text-[#878787]">
                Spaces
              </span>
              <div className="max-h-[260px] overflow-y-auto">
                <SelectOrgTable data={organizations} />
              </div>
            </>
          )}

          {/* If there are invites, show them */}
          {invites?.length > 0 && <OrganizationInvites />}

          <div className="relative mt-12 w-full border-t-[1px] border-dashed border-border pt-6 text-center">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background px-4 text-sm text-[#878787]">
              Or
            </span>
            <Link href="/spaces/create" className="w-full">
              <Button className="mt-2 w-full" variant="outline">
                Create space
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
