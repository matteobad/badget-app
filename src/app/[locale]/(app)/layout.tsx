import { type PropsWithChildren } from "react";
import { AppSidebar } from "~/components/app-sidebar";
import CreateCategoryDialog from "~/components/category/create-category-dialog";
import CategorySheet from "~/components/category/sheets/category-sheet";
import { FeedbackDialog } from "~/components/feedback-dialog";
import { DynamicBreadcrumb } from "~/components/layouts/dynamic-breadcrumb";
import { NavUser } from "~/components/nav-user";
import CreateTransactionSheet from "~/components/transaction/sheets/create-transaction-sheet";
import TransactionSheet from "~/components/transaction/sheets/transaction-sheet";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export default function AppLayout(props: PropsWithChildren) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
              <FeedbackDialog />
              <NavUser />
            </div>
          </header>
          {props.children}
        </SidebarInset>
      </SidebarProvider>

      {/* Global Sheets here */}
      <CreateCategoryDialog />
      <CreateTransactionSheet />
      <TransactionSheet />
      <CategorySheet />
      {/* <ImportTransactionDrawerDialog /> */}
    </>
  );
}
