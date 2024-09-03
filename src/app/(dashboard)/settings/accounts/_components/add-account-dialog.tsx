"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { AddAccountMultiStep } from "./steps/add-account-multi-step";

export function AddBankAccountModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const isOpen = true;

  const handleOnClose = () => {
    // void setParams(
    //   {
    //     step: null,
    //     countryCode: null,
    //   },
    //   {
    //     shallow: true,
    //   },
    // );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Aggiungi Conto</DialogTitle>
          <DialogDescription>
            Se non trovi il tuo conto nella lista delle connessioni supportate,
            qui puoi tracciare comunque il tuo conto manualmente.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
