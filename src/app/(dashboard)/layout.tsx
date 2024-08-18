import dynamic from "next/dynamic";

import { SiteFooter } from "../_components/footer";
import { TopbarNav } from "../_components/topbar-nav";
import { Sidebar } from "./_components/sidebar";
import { SidebarAccounts } from "./_components/sidebar-accounts";

export default async function DashboardLayout(props: {
  children: React.ReactNode;
}) {
  const ConnectBankModal = dynamic(
    () =>
      import("~/components/dialogs/connect-bank-modal").then(
        (mod) => mod.ConnectBankModal,
      ),
    {
      ssr: false,
    },
  );

  const AddBankAccountModal = dynamic(
    () =>
      import("~/components/dialogs/add-bank-account-modal").then(
        (mod) => mod.AddBankAccountModal,
      ),
    {
      ssr: false,
    },
  );

  const SelectBankAccountsModal = dynamic(
    () =>
      import("~/components/dialogs/select-bank-accounts-modal").then(
        (mod) => mod.SelectBankAccountsModal,
      ),
    {
      ssr: false,
    },
  );

  const AddCategoryModal = dynamic(
    () =>
      import("~/components/dialogs/add-category-modal").then(
        (mod) => mod.AddCategoryModal,
      ),
    {
      ssr: false,
    },
  );

  return (
    <>
      <div className="min-h-screen overflow-hidden rounded-[0.5rem]">
        <TopbarNav />
        <div className="flex">
          <nav className="flex w-[250px] flex-col gap-2 py-4">
            <Sidebar />
            <SidebarAccounts />
          </nav>
          <main className="grow">{props.children}</main>
        </div>
        <SiteFooter />
      </div>

      {/* Modals triggered by url search params */}
      <ConnectBankModal countryCode={"IT"} />
      <SelectBankAccountsModal />
      <AddBankAccountModal />
      <AddCategoryModal />
    </>
  );
}
