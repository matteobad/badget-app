import {
  Building,
  Coins,
  CreditCard,
  EllipsisIcon,
  HandCoins,
  Landmark,
} from "lucide-react";

import { ToggleBankAccountSwitch } from "~/components/forms/accounts/toggle-bank-account-switch";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { TableCell, TableRow } from "~/components/ui/table";
import { euroFormat } from "~/lib/utils";
import { type getUserBankConnections } from "~/server/db/queries/cached-queries";
import { BankAccountType } from "~/server/db/schema/enum";

export default function BankAccountList({
  data,
}: {
  data: Awaited<
    ReturnType<typeof getUserBankConnections>
  >[number]["bankAccount"];
}) {
  return (
    <>
      {data.map((bankAccount) => (
        <TableRow key={bankAccount.id}>
          <TableCell>
            <div className="flex items-center gap-2 pl-14">
              {(() => {
                switch (bankAccount.type) {
                  case BankAccountType.CREDIT:
                    return <Coins className="size-4" />;
                  case BankAccountType.DEPOSITORY:
                    return <Landmark className="size-4" />;
                  case BankAccountType.LOAN:
                    return <HandCoins className="size-4" />;
                  case BankAccountType.OTHER_ASSET:
                    return <Building className="size-4" />;
                  case BankAccountType.OTHER_LIABILITY:
                    return <CreditCard className="size-4" />;
                  default:
                    return null;
                }
              })()}
              {bankAccount.name}
            </div>
          </TableCell>
          <TableCell>
            <ToggleBankAccountSwitch
              id={bankAccount.id}
              enabled={!!bankAccount.enabled}
            />
          </TableCell>
          <TableCell className="text-right">
            {euroFormat(bankAccount.balance ?? "0")}
          </TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="mx-auto flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <EllipsisIcon className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>Modifica</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Elimina
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
