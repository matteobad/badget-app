"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useTransactionParams } from "~/hooks/use-transaction-params";

import CreateTransactionForm from "../forms/create-transaction-form";

export default function CreateTransactionSheet() {
  const { params, setParams } = useTransactionParams();

  const isOpen = !!params.createTransaction;

  const onOpenChange = () => {
    void setParams(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6 p-[3px]">
            <SheetTitle>Crea transazione</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full p-0 pb-[100px]" hideScrollbar>
            <CreateTransactionForm />
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
