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
import { actionsParsers } from "~/utils/search-params";

export function AddAccountButton({ label }: { label?: string }) {
  const [, setState] = useQueryStates(actionsParsers, { shallow: false });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => void setState({ action: "link-institution" })}
        >
          <Landmark />
          Collega
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setState({ action: "import-transaction" })}
        >
          <FileSpreadsheet />
          Importa
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setState({ action: "create-account" })}
        >
          <FilePlus /> Crea account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
