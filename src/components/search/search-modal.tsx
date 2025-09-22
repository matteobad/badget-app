"use client";

import { useSearchStore } from "~/lib/stores/search";
import { useHotkeys } from "react-hotkeys-hook";

import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Search } from "./search";
import { SearchFooter } from "./search-footer";

export function SearchModal() {
  const { isOpen, setOpen } = useSearchStore();

  useHotkeys("meta+k", () => setOpen(), {
    enableOnFormTags: true,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent
        className="m-0 h-auto w-full max-w-full gap-0 overflow-hidden border-none bg-transparent p-0 select-text md:max-w-[740px]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <Search />
        <SearchFooter />
      </DialogContent>
    </Dialog>
  );
}
