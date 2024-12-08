import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { getAccountsForActiveWorkspace } from "~/server/db/queries/accounts-queries-cached";
import { AccountsEmptyPlaceholder } from "./transactions-empty-placeholder";

export default async function BankingAccountsPage() {
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
    </>
  );
}
