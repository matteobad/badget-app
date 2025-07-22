import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import AccountCardGrid from "~/features/account/components/account-card-grid";
import { AddAccountButton } from "~/features/account/components/add-account-button";
import CreateAccountDrawerSheet from "~/features/account/components/create-account-drawer-sheet";
import LinkInstitutionDrawerDialog from "~/features/account/components/link-institution-drawer-dialog";
import { ManageConnectionsButton } from "~/features/account/components/manage-connections-button";
import ManageConnectionsDrawerDialog from "~/features/account/components/manage-connections-drawer-dialog";
import {
  getAccountsForUser_CACHED,
  getConnectionsForUser_CACHED,
} from "~/features/account/server/cached-queries";
import { getInstitutionsForCountry } from "~/features/account/server/queries";
import { accountsSearchParamsCache } from "~/features/account/utils/search-params";
import { auth } from "~/server/auth/auth";
import { type SearchParams } from "nuqs/server";

type BankingAccountsPageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function AccountsPage({
  searchParams,
}: BankingAccountsPageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await accountsSearchParamsCache.parse(searchParams);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const institutions = await getInstitutionsForCountry("IT");
  const promise = Promise.all([getConnectionsForUser_CACHED(session.user.id)]);
  const promises = Promise.all([getAccountsForUser_CACHED(session.user.id)]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-xl font-medium">
                I tuoi conti, sotto controllo
              </h2>
              <p className="text-sm font-light text-muted-foreground">
                Dai risparmi agli investimenti, tutto in un unico sguardo.
              </p>
            </div>
            <div className="flex items-end gap-2">
              <ManageConnectionsButton />
              <AddAccountButton label="Aggiungi un conto" />
            </div>
          </div>
          <Suspense fallback={<Skeleton />}>
            <AccountCardGrid promises={promises} />
          </Suspense>
        </div>
      </div>

      <LinkInstitutionDrawerDialog institutions={institutions} />
      <CreateAccountDrawerSheet />
      <ManageConnectionsDrawerDialog promise={promise} />
    </>
  );
}
