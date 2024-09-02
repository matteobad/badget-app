"use client";

import { AnimatePresence } from "framer-motion";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useConnectParams } from "~/hooks/use-connect-params";
import { CreateAccountForm } from "./steps/create-account-form";
import { SelectConnectionForm } from "./steps/select-connection-form";

export function AddBankAccountModal() {
  const { step, setParams } = useConnectParams();

  const isOpen = !!step;

  const handleOnClose = () => {
    void setParams(
      {
        step: null,
        countryCode: null,
      },
      {
        shallow: true,
      },
    );
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
        <AnimatePresence mode="wait">
          {step === "select-connection" && <SelectConnectionForm />}
          {step === "create-account" && <CreateAccountForm />}
          {/* {step === "select-accounts" && <SelectAccountsForm />}
          {step === "tag-transactions" && <TagTransactionsForm />}
          {step === "done" && <Done />} */}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
