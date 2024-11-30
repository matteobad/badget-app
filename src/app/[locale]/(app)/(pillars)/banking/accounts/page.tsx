import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { AccountsEmptyPlaceholder } from "./accounts-empty-placeholder";

export default function BankingPage() {
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
        <AccountsEmptyPlaceholder />
      </div>
    </>
  );
}
