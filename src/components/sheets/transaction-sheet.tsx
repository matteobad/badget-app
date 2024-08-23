"use client";

import type { Transaction } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { type Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { useMediaQuery } from "~/hooks/use-media-query";
import { TransactionDetails } from "../transaction-details";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Sheet, SheetContent } from "../ui/sheet";

type TransactionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: Transaction;
  categories: Category[];
};

export function TransactionSheet({
  open,
  onOpenChange,
  data,
  categories,
}: TransactionSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!data) return <></>;

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="bottom-4 right-4 top-4 h-auto rounded">
          <TransactionDetails data={data} categories={categories} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="p-6">
        <TransactionDetails data={data} categories={categories} />
      </DrawerContent>
    </Drawer>
  );
}
