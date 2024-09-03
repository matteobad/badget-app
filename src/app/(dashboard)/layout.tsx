import dynamic from "next/dynamic";

import DashboardLayout from "~/components/dashboard-layout";
import { getUserCategories } from "~/server/db/queries/cached-queries";

export default async function Layout(props: { children: React.ReactNode }) {
  const userCategories = await getUserCategories({});

  // const ConnectBankModal = dynamic(
  //   () =>
  //     import("~/components/dialogs/connect-bank-modal").then(
  //       (mod) => mod.ConnectBankModal,
  //     ),
  //   {
  //     ssr: false,
  //   },
  // );

  // const AddBankAccountModal = dynamic(
  //   () =>
  //     import("~/components/dialogs/add-bank-account-modal").then(
  //       (mod) => mod.AddBankAccountModal,
  //     ),
  //   {
  //     ssr: false,
  //   },
  // );

  // const SelectBankAccountsModal = dynamic(
  //   () =>
  //     import("~/components/dialogs/select-bank-accounts-modal").then(
  //       (mod) => mod.SelectBankAccountsModal,
  //     ),
  //   {
  //     ssr: false,
  //   },
  // );

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
      <DashboardLayout>{props.children}</DashboardLayout>

      {/* Modals triggered by url search params */}
      {/* <ConnectBankModal countryCode={"IT"} />
      <SelectBankAccountsModal />
      <AddBankAccountModal /> */}
      <AddCategoryModal categories={userCategories} />
    </>
  );
}
