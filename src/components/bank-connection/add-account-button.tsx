"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { useConnectParams } from "~/hooks/use-connect-params";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { FilePlus, Landmark } from "lucide-react";

export function AddAccountButton() {
  const { setParams: setTransactionParams } = useTransactionParams();
  const { setParams: setBankAccountParams } = useBankAccountParams();
  const { setParams: setBankConnectParams } = useConnectParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Add account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuItem
          onClick={() => {
            void setTransactionParams({
              transactionId: null,
              createTransaction: null,
              importTransaction: null,
            });
            void setBankAccountParams({
              bankAccountId: null,
              createBankAccount: null,
            });
            void setBankConnectParams({
              step: "connect",
            });
          }}
        >
          <Landmark />
          Collega un conto
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            void setTransactionParams({
              transactionId: null,
              createTransaction: null,
              importTransaction: null,
            });
            void setBankAccountParams({
              bankAccountId: null,
              createBankAccount: true,
            });
          }}
        >
          <FilePlus /> Crea manualmente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
