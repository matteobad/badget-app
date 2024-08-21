"use client";

import { BankAccount } from "~/server/db/queries/cached-queries";
import { UpdateBankAccountForm } from "../forms/accounts/update-bank-account-form";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type UpdateBankAccountModalProps = {
  bankAccount: BankAccount["bankAccount"][number];
};

export function UpdateBankAccountModal({
  bankAccount,
}: UpdateBankAccountModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <span>Modifica</span>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Modifica Conto</DialogTitle>
          <DialogDescription>
            Se non trovi il tuo conto nella lista delle connessioni supportate,
            qui puoi tracciare comunque il tuo conto manualmente.
          </DialogDescription>
        </DialogHeader>
        <UpdateBankAccountForm bankAccount={bankAccount} />
      </DialogContent>
    </Dialog>
  );
}
