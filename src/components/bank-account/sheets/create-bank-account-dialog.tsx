"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";

import CreateBankAccountForm from "../forms/create-bank-account-form";

export default function CreateBankAccountDialog() {
  const { params, setParams } = useBankAccountParams();

  const isOpen = !!params.createBankAccount;

  const handleClose = () => {
    void setParams({ createBankAccount: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Un nuovo conto, un nuovo inizio.</DialogTitle>
            <DialogDescription>
              Scegli il tipo, aggiungi i dettagli e sei pronto!
            </DialogDescription>
          </DialogHeader>

          <CreateBankAccountForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
