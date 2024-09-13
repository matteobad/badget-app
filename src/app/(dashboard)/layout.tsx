import dynamic from "next/dynamic";
import { cookies } from "next/headers";

import { AppSidebar } from "~/components/app-sidebar";
import { NotificationCard } from "~/components/onboarding-card";
import { SidebarLayout, SidebarTrigger } from "~/components/ui/sidebar";
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
    <SidebarLayout
      defaultOpen={cookies().get("sidebar:state")?.value === "true"}
    >
      <AppSidebar notificationCard={<NotificationCard />} />
      <main className="flex flex-1 flex-col p-2 transition-all duration-300 ease-in-out">
        <div className="flex flex-1 flex-col justify-between rounded-md">
          {props.children}
          <SidebarTrigger />
        </div>
      </main>

      <AddCategoryModal categories={userCategories} />
    </SidebarLayout>
  );
}
