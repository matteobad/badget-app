"use client";

import { GridIcon, ListIcon } from "lucide-react";
import { useDocumentParams } from "~/hooks/use-document-params";
import { cn } from "~/lib/utils";

import { Button } from "../ui/button";

export function VaultViewSwitch() {
  const { params, setParams } = useDocumentParams();

  return (
    <div className="flex gap-2 text-[#878787]">
      <Button
        variant="outline"
        size="icon"
        className={cn(params.view === "grid" && "border-primary text-primary")}
        onClick={() => setParams({ view: "grid" })}
      >
        <GridIcon size={18} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={cn(params.view === "list" && "border-primary text-primary")}
        onClick={() => setParams({ view: "list" })}
      >
        <ListIcon size={18} />
      </Button>
    </div>
  );
}
