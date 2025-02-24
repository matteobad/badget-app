import { auth } from "@clerk/nextjs/server";
import { type SearchParams } from "nuqs/server";

import AccountCardGrid from "~/features/account/components/account-card-grid";
import CreateAccountDrawerSheet from "~/features/account/components/create-account-drawer-sheet";
import UpdateAccountDrawerSheet from "~/features/account/components/update-account-drawer-sheet";
import { getAccountsForUser_CACHED } from "~/features/account/server/cached-queries";
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

  const session = await auth();
  if (!session.userId) throw new Error("User not found");

  const data = await getAccountsForUser_CACHED(session.userId);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {data.length === 0 ? (
          <AccountsEmptyPlaceholder />
        ) : (
          <AccountCardGrid data={data} />
        )}
      </div>

      <AddSelectorDialog open={action === "add"} />
      <CreateAccountDrawerSheet />
      <UpdateAccountDrawerSheet data={data} />
    </>
  );
}
