"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";

// import CreateAccountForm from "./create-account-form";

export default function CreateBankAccountSheet() {
  const { params, setParams } = useBankAccountParams();

  const isOpen = !!params.createBankAccount;

  const handleClose = () => {
    void setParams({ createBankAccount: null });
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Un nuovo conto, un nuovo inizio.</SheetTitle>
            <SheetDescription>
              Scegli il tipo, aggiungi i dettagli e sei pronto!
            </SheetDescription>
          </SheetHeader>
          {/* <CreateAccountForm onComplete={handleClose} /> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
