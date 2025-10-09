"use client";

import { SearchIcon } from "lucide-react";
import { useSearchStore } from "~/lib/stores/search";

import { Button } from "../ui/button";

export function OpenSearchButton() {
  const { setOpen } = useSearchStore();

  return (
    <Button
      variant="outline"
      className="no-drag relative hidden w-full min-w-[250px] cursor-pointer justify-start border-0 !p-0 text-sm font-normal text-muted-foreground shadow-none hover:bg-transparent sm:pr-12 md:flex md:w-40 lg:w-64"
      onClick={() => setOpen()}
    >
      <SearchIcon className="mr-1 size-3.5" />
      <span>Cerca qualsiasi cosa...</span>
    </Button>
  );
}
