import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import AccountCardGrid from "~/features/account/components/account-card-grid";
import { AddAccountButton } from "~/features/account/components/add-account-button";
import CreateAccountDrawerSheet from "~/features/account/components/create-account-drawer-sheet";
import UpdateAccountDrawerSheet from "~/features/account/components/update-account-drawer-sheet";
import { getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
import { accountsSearchParamsCache } from "~/features/account/utils/search-params";
import LinkInstitutionDrawerDialog from "~/features/open-banking/components/link-institution-drawer-dialog";
import { getInstitutionsForCountry } from "~/features/open-banking/server/queries";
import { AccountsEmptyPlaceholder } from "../../../../features/account/components/accounts-empty-placeholder";

type BankingAccountsPageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function BankingAccountsPage({
  searchParams,
}: BankingAccountsPageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const {} = await accountsSearchParamsCache.parse(searchParams);

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const institutions = await getInstitutionsForCountry("IT");
  const data = await getAccountsForUser_CACHED(session.userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {data.length === 0 ? (
          <AccountsEmptyPlaceholder />
        ) : (
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
              <AddAccountButton label="Aggiungi un conto" />
            </div>
            <AccountCardGrid data={data} />
          </div>
        )}
      </div>

      <LinkInstitutionDrawerDialog institutions={institutions} />
      <CreateAccountDrawerSheet />
      <UpdateAccountDrawerSheet data={data} />
    </>
  );
}
