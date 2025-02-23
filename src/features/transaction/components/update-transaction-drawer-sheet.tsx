"use client";

import { useMemo } from "react";
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
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { type getTransactionForUser_CACHED } from "../server/cached-queries";
import { transactionsParsers } from "../utils/search-params";
import UpdateTransactionForm from "./update-transaction-form";

type Transaction = Awaited<
  ReturnType<typeof getTransactionForUser_CACHED>
>[number];

export default function UpdateTransactionDrawerSheet({
  accounts,
  categories,
  transactions,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
  transactions: Transaction[];
}) {
  const [{ id }, setParams] = useQueryStates(transactionsParsers);
  const isMobile = useIsMobile();

  const open = !!id;

  const transaction = useMemo(() => {
    return transactions.find((t) => t.id === id);
  }, [id, transactions]);

  const handleClose = () => {
    void setParams({ id: null });
  };

  if (!transaction) return;

  const DrawerSheetContent = () => (
    <UpdateTransactionForm
      className={cn({ "px-4": isMobile })}
      accounts={accounts}
      categories={categories}
      transaction={transaction}
      onComplete={handleClose}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Modifica spesa o entrata</DrawerTitle>
            <DrawerDescription>
              Modifica un movimento per tenere tutto sotto controllo.
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
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="p-4 [&>button]:hidden">
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Modifica spesa o entrate</SheetTitle>
            <SheetDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>
          <DrawerSheetContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
