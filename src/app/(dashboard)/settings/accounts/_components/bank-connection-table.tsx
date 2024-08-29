"use client";

import { AvatarFallback } from "@radix-ui/react-avatar";
import {
  Cable,
  Delete,
  EllipsisIcon,
  RefreshCw,
  RotateCw,
  Trash,
} from "lucide-react";

import { Avatar, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { euroFormat } from "~/lib/utils";
import { type getUserBankConnections } from "~/server/db/queries/cached-queries";
import BankAccountList from "./bank-account-list";

export function BankConnectionTable({
  data,
}: {
  data: Awaited<ReturnType<typeof getUserBankConnections>>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-medium">Nome</TableHead>
          <TableHead className="font-medium">Stato</TableHead>
          <TableHead className="text-right font-medium">Saldo</TableHead>
          <TableHead className="w-16"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((connection) => (
          <Collapsible key={connection.id} asChild>
            <>
              <CollapsibleTrigger asChild>
                <TableRow>
                  <TableCell className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={connection.logoUrl ?? ""} />
                      <AvatarFallback>BC</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="">{connection.name}</span>
                      <span className="text-sm text-slate-500">
                        {connection.bankAccount.length} conti
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{connection.status}</Badge>
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {euroFormat(
                      connection.bankAccount.reduce((tot, account) => {
                        return (tot += parseFloat(account.balance ?? "0"));
                      }, 0),
                    )}
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
                        <DropdownMenuItem>
                          <Cable className="mr-2 size-4" />
                          Ricollega
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 size-4" />
                          Sincronizza
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash className="mr-2 size-4" />
                          Elimina
                          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </CollapsibleTrigger>

              <CollapsibleContent asChild>
                <BankAccountList data={connection.bankAccount} />
              </CollapsibleContent>
            </>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  );
}
