import Image from "next/image";
import { format } from "date-fns";
import { EllipsisIcon, PlugZapIcon, RefreshCwIcon } from "lucide-react";

import { AddBankAccountButton } from "~/app/(dashboard)/_components/add-bank-account-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { euroFormat, getInitials } from "~/lib/utils";
import { getUserBankAccounts } from "~/server/db/queries/cached-queries";

// import { BankConnections } from "./bank-connections";
// import { ManualAccounts } from "./manual-accounts";

export function BankAccountListLoading() {
  return (
    <div className="space-y-6 divide-y px-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="ml-[30px] divide-y">
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm font-medium leading-none">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between pt-4">
            <div className="flex items-center">
              <Skeleton className="flex h-9 w-9 items-center justify-center space-y-0 rounded-full" />
              <div className="ml-4 flex flex-col">
                <p className="mb-1 text-sm font-medium leading-none">
                  <Skeleton className="h-3 w-[200px] rounded-none" />
                </p>
                <span className="text-xs font-medium text-[#606060]">
                  <Skeleton className="mt-1 h-2.5 w-[100px] rounded-none" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function BankAccountList() {
  const data = await getUserBankAccounts();
  // const manualAccounts = data.filter((item) => item.bank_accounts.manual);

  if (data.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-2xl font-bold tracking-tight">Nessun Conto</h3>
          <p className="text-sm text-muted-foreground">
            Cominciamo aggiungendo il tuo primo conto corrente.
          </p>
        </div>
        <AddBankAccountButton label="Aggiungi Conto" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-6">
      <Accordion type="single" collapsible className="w-full">
        {data.map((item) => {
          return (
            <AccordionItem value={item.name} key={item.id}>
              <AccordionTrigger className="flex flex-row-reverse justify-end gap-4 hover:no-underline">
                <div className="flex w-full items-center gap-4">
                  <Image
                    src={item.logoUrl!}
                    alt="Logo"
                    width={40}
                    height={40}
                    className="row-span-2"
                  />
                  <div className="flex flex-col text-left">
                    <span>{item.name}</span>
                    <span className="text-sm font-light">
                      Aggiornato il{" "}
                      {format(item.updatedAt ?? item.createdAt, "dd MMM yyy")}
                    </span>
                  </div>
                  <span className="flex-1"></span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                  >
                    <PlugZapIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="rounded-full"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent className="4 ml-10 mt-4">
                {item.bankAccount.map((account) => {
                  return (
                    <div
                      className="mb-4 flex w-full items-center gap-4"
                      key={account.id}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(account.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-left">
                        <span>{account.name}</span>
                        <span className="text-sm font-light">
                          {account.type}
                        </span>
                      </div>
                      <span className="flex-1"></span>
                      <span className="">
                        {euroFormat(account.amount ?? "0")}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                      >
                        <EllipsisIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <AddBankAccountButton label="Aggiungi Conto" />
    </div>
  );
}
