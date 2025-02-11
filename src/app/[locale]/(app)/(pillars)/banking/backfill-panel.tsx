"use client";

import { parseAsString, useQueryStates } from "nuqs";

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
import { cn } from "~/lib/utils";

function BackfillTransactionForm({ className }: React.ComponentProps<"form">) {
  return <form className={cn("flex h-full flex-col gap-6", className)}></form>;
}

export default function BackfillPanel() {
  const isMobile = useIsMobile();
  const [params, setParams] = useQueryStates({ action: parseAsString });
  const open = params.action === "backfill";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={() => setParams({ action: null })}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nuova spesa o entrata</DrawerTitle>
            <DrawerDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </DrawerDescription>
          </DrawerHeader>
          <BackfillTransactionForm className="px-4" />
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
    <Sheet open={open} onOpenChange={() => setParams({ action: null })}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Nuova spesa o entrata</SheetTitle>
            <SheetDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>
          <BackfillTransactionForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
