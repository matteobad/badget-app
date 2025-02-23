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
            <DrawerTitle>Crea un nuovo conto</DrawerTitle>
            <DrawerDescription>
              Ogni euro ha la sua storia: crea conti e organizza le tue finanze.
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
            <SheetTitle>Crea un nuovo conto</SheetTitle>
            <SheetDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </SheetDescription>
          </SheetHeader>
          <CreateAccountForm onComplete={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
