"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useTransactionParams } from "~/hooks/use-transaction-params";

import UpdateTransactionForm from "../forms/update-transaction-form";

export default function UpdateTransactionSheet() {
  const { params, setParams } = useTransactionParams();

  const isOpen = !!params.transactionId;

  const onOpenChange = () => {
    void setParams({ transactionId: null });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-4 [&>button]:hidden">
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Modifica spesa o entrate</SheetTitle>
            <SheetDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>

          <UpdateTransactionForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
