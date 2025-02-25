"use client";

import { FilePlus, Landmark, Plus } from "lucide-react";
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
        <Button className="w-[180px]">
          <Plus className="size-4" />
          {label}
        </Button>
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
