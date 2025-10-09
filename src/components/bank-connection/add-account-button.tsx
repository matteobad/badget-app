"use client";

import { FilePlus, Landmark, PlusIcon } from "lucide-react";
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
import { useScopedI18n } from "~/shared/locales/client";

export function AddAccountButton() {
  const tScoped = useScopedI18n("account.actions");

  const { setParams: setTransactionParams } = useTransactionParams();
  const { setParams: setBankAccountParams } = useBankAccountParams();
  const { setParams: setBankConnectParams } = useConnectParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <PlusIcon />
          {tScoped("add")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]" align="end">
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
          {tScoped("connect")}
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
          <FilePlus /> {tScoped("create")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
