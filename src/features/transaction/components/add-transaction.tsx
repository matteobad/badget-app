"use client";

import { FilePlus, FileSpreadsheet, Landmark, Plus } from "lucide-react";
import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { transactionsParsers } from "../utils/search-params";

type AddTransactionProps = {
  label?: string;
};

export function AddTransaction({ label }: AddTransactionProps) {
  const [, setState] = useQueryStates(transactionsParsers, { shallow: false });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => void setState({ action: "connect" })}>
          <Landmark />
          Collega
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setState({ action: "import" })}>
          <FileSpreadsheet />
          Importa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void setState({ action: "add" })}>
          <FilePlus /> Crea transazione
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
