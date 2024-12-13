import { type SearchParams } from "nuqs/server";

import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <DynamicBreadcrumb />
        </div>
      </header>

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
