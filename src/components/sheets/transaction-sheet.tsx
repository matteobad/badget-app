"use client";

import type { Transaction } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { useMediaQuery } from "~/hooks/use-media-query";
import { TransactionDetails } from "../transaction-details";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Sheet, SheetContent } from "../ui/sheet";

type TransactionSheetProps = {
  setOpen: (open: string) => void;
  isOpen: boolean;
  data: Transaction;
  categories: Category[];
};

export function TransactionSheet({
  setOpen,
  isOpen,
  data,
  categories,
}: TransactionSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Sheet open={!!isOpen} onOpenChange={() => setOpen("")}>
        <SheetContent className="bottom-4 right-4 top-4 h-auto rounded">
          <TransactionDetails data={data} categories={categories} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={() => setOpen("")}>
      <DrawerContent className="p-6">
        <TransactionDetails data={data} categories={categories} />
      </DrawerContent>
    </Drawer>
  );
}
