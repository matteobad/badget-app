"use client";

import { useQueryStates } from "nuqs";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { transactionsParsers } from "../transaction-search-params";
import { CreateTransactionForm } from "./create-transaction-form";

export function CreateTransactionSheet() {
  const [{ action }, setValues] = useQueryStates(transactionsParsers, {
    shallow: false,
  });

  return (
    <Sheet
      open={action === "add"}
      onOpenChange={() => {
        void setValues({ action: null });
      }}
    >
      <SheetContent className="flex flex-col gap-8">
        <SheetHeader>
          <SheetTitle>Crea transazione</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
        <CreateTransactionForm />
      </SheetContent>
    </Sheet>
  );
}
