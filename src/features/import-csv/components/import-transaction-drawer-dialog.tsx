"use client";

import { useQueryStates } from "nuqs";

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
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { actionsParsers } from "~/utils/search-params";
import ImportTransactionForm from "./import-transaction-form";

export default function ImportTransactionDrawerDialog({
  accounts,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
}) {
  const [{ action }, setParams] = useQueryStates(actionsParsers);
  const open = action === "import-transaction";

  const isMobile = useIsMobile();

  const DrawerDialogContent = () => (
    <ImportTransactionForm
      className={cn({ "px-4": isMobile })}
      accounts={accounts}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={() => setParams({ action: null })}>
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
    <Dialog open={open} onOpenChange={() => setParams({ action: null })}>
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
