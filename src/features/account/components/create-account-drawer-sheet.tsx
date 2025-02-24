"use client";

import { useQueryStates } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { actionsParsers } from "~/utils/search-params";
import CreateAccountForm from "./create-account-form";

export default function CreateAccountDrawerSheet() {
  const isMobile = useIsMobile();
  const [{ action }, setParams] = useQueryStates(actionsParsers);

  const open = action === "create-account";

  const handleClose = () => {
    void setParams({ action: null });
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Un nuovo conto, un nuovo inizio.</DrawerTitle>
            <DrawerDescription>
              Scegli il tipo, aggiungi i dettagli e sei pronto!
            </DrawerDescription>
          </DrawerHeader>
          <CreateAccountForm className="px-4" onComplete={handleClose} />
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" asChild>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Un nuovo conto, un nuovo inizio.</SheetTitle>
            <SheetDescription>
              Scegli il tipo, aggiungi i dettagli e sei pronto!
            </SheetDescription>
          </SheetHeader>
          <CreateAccountForm onComplete={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
