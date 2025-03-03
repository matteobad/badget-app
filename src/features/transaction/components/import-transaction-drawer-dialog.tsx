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
import { type Sheet } from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import ImportTransactionForm from "./import-transaction-form";

interface ImportTransactionDrawerDialogProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  accounts: DB_AccountType[];
}

export default function ImportTransactionDrawerDialog({
  accounts,
  ...props
}: ImportTransactionDrawerDialogProps) {
  const isMobile = useIsMobile();

  const DrawerDialogContent = () => (
    <ImportTransactionForm
      className={cn({ "px-4": isMobile })}
      accounts={accounts}
    />
  );

  if (isMobile) {
    return (
      <Drawer {...props}>
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
    <Dialog {...props}>
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
