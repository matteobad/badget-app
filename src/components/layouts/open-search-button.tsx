"use client";

import { useSearchStore } from "~/lib/stores/search";
import { BrainCircuitIcon } from "lucide-react";

import { Button } from "../ui/button";

export function OpenSearchButton() {
  const { setOpen } = useSearchStore();

  return (
    <Button
      variant="outline"
      className="no-drag relative hidden w-full min-w-[250px] justify-start border-0 !p-0 text-sm font-normal text-muted-foreground shadow-none hover:bg-transparent sm:pr-12 md:flex md:w-40 lg:w-64"
      onClick={() => setOpen()}
    >
      <BrainCircuitIcon size={18} className="mr-2" />
      <span>Find anything...</span>
      <kbd className="pointer-events-none absolute top-1.5 right-1.5 hidden h-5 items-center gap-1 border bg-accent px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
