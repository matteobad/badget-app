import dynamic from "next/dynamic";

import type { TopbarItem } from "../_components/topbar";
import Topbar from "../_components/topbar";

const bankingTopbarItems = [
  { title: "Overview", href: "/banking" },
  { title: "Conti", href: "/banking/accounts" },
  { title: "Transazioni", href: "/banking/transactions" },
] satisfies TopbarItem[];

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

  const SelectBankAccountsModal = dynamic(
    () =>
      import("~/components/dialogs/select-bank-accounts-modal").then(
        (mod) => mod.SelectBankAccountsModal,
      ),
    {
      ssr: false,
    },
  );

  return (
    <div className="flex min-h-[calc(100vh-130px)] flex-col gap-6 overflow-hidden p-6">
      <Topbar items={bankingTopbarItems} />
      <div className="flex flex-1">{props.children}</div>

      {/* Modals triggered by url search params */}
      <ConnectBankModal countryCode={"IT"} />
      <SelectBankAccountsModal />
    </div>
  );
}
