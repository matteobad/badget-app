"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { FilePlus, FileSpreadsheet, Landmark, Plus } from "lucide-react";

export function AddTransactionButton({ label }: { label?: string }) {
  const { setParams } = useTransactionParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]" align="end">
        <DropdownMenuItem>
          <Landmark />
          Collega un conto
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            void setParams({
              createTransaction: null,
              importTransaction: true,
            })
          }
        >
          <FileSpreadsheet />
          Importa da CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            void setParams({
              createTransaction: true,
              importTransaction: null,
            })
          }
        >
          <FilePlus /> Crea transazione
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
