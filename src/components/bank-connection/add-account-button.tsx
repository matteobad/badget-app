"use client";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { actionsParsers } from "~/utils/search-params";
import { FilePlus, Landmark } from "lucide-react";
import { useQueryStates } from "nuqs";

export function AddAccountButton() {
  const [, setState] = useQueryStates(actionsParsers, { shallow: false });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>Add account</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        <DropdownMenuItem
          onClick={() => void setState({ action: "link-institution" })}
        >
          <Landmark />
          Collega un conto
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => void setState({ action: "create-account" })}
        >
          <FilePlus /> Crea manualmente
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
