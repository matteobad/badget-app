"use client";

import { useConnectParams } from "~/hooks/use-connect-params";
import { AddBankAccountForm } from "../forms/accounts/add-bank-account-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function AddBankAccountModal() {
  const { step, setParams } = useConnectParams();

  const isOpen = step === "manual";

  const handleOnClose = () => {
    void setParams(
      {
        step: null,
        countryCode: null,
      },
      {
        // NOTE: Rerender so the overview modal is visible
        shallow: false,
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aggiungi Conto</DialogTitle>
          <DialogDescription>
            Se non trovi il tuo conto nella lista delle connessioni supportate,
            qui puoi tracciare comunque il tuo conto manualmente.
          </DialogDescription>
        </DialogHeader>
        <AddBankAccountForm />
      </DialogContent>
    </Dialog>
  );
}
