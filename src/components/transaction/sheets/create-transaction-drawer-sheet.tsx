"use client";

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
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";

import CreateTransactionForm from "../forms/create-transaction-form";

export default function CreateTransactionDrawerSheet() {
  const isMobile = useIsMobile();

  const { params, setParams } = useTransactionParams();

  const isOpen = !!params.createTransaction;

  const onOpenChange = () => {
    void setParams(null);
  };

  const DrawerSheetContent = () => (
    <CreateTransactionForm className={cn({ "px-4": isMobile })} />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nuova spesa o entrata</DrawerTitle>
            <DrawerDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerSheetContent />
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Nuova spesa o entrata</SheetTitle>
            <SheetDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>

          {/* <ScrollArea className="h-full p-0"> */}
          <DrawerSheetContent />
          {/* </ScrollArea> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
