import { type SearchParams } from "nuqs/server";

import { getAccountsForActiveWorkspace } from "~/server/db/queries/accounts-queries-cached";
import { AccountsEmptyPlaceholder } from "./_components/accounts-empty-placeholder";
import { AddSelectorDialog } from "./_components/add-selector-dialog";
import { accountsSearchParamsCache } from "./account-search-params";

type BankingAccountsPageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function BankingAccountsPage({
  searchParams,
}: BankingAccountsPageProps) {
  // ⚠️ Don't forget to call `parse` here.
  // You can access type-safe values from the returned object:
  const { action } = await accountsSearchParamsCache.parse(searchParams);

  const accounts = await getAccountsForActiveWorkspace();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {accounts.length === 0 ? (
          <AccountsEmptyPlaceholder />
        ) : (
          accounts.map((account) => {
            return <span key={account.id}>{account.name}</span>;
          })
        )}
      </div>

      <AddSelectorDialog open={action === "add"} />
      {/* <ImportModal /> */}
    </>
  );
}
