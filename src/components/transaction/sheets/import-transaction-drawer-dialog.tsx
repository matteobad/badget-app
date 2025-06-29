"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";

import ImportTransactionForm from "../forms/import-transaction-form";

export default function ImportTransactionDrawerDialog() {
  const isMobile = useIsMobile();

  const { params, setParams } = useTransactionParams();

  const isOpen = !!params.importTransaction;

  const onOpenChange = () => {
    void setParams(null);
  };

  const DrawerDialogContent = () => (
    <ImportTransactionForm className={cn({ "px-4": isMobile })} />
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Importazione rapida da CSV</DrawerTitle>
            <DrawerDescription>
              Semplifica la gestione, carica il file e verifica i dati.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerDialogContent />
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-4">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Importazione rapida da CSV</DialogTitle>
            <DialogDescription>
              Semplifica la gestione, carica il file e verifica i dati.
            </DialogDescription>
          </DialogHeader>
          <DrawerDialogContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
