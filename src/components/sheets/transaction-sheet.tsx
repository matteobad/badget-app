"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";

import { useMediaQuery } from "~/hooks/use-media-query";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export function TransactionSheet() {
  const [accountId] = useQueryState("bankAccountId");
  const [isOpen, setOpen] = useState(!!accountId);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={!!isOpen} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader className="mb-8">
            <SheetTitle>Dettagli del Conto</SheetTitle>
          </SheetHeader>
          {/* <TransactionDetails id={accountId} /> */}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="p-6">
        {/* <TransactionDetails id={accountId} /> */}
      </DrawerContent>
    </Drawer>
  );
}
