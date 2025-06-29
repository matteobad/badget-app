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

import { type getTransactions_CACHED } from "../../../features/transaction/server/cached-queries";
import UpdateTransactionForm from "../forms/update-transaction-form";

type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

interface UpdateTransactionDrawerSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
  transaction: TransactionType | null;
}

export default function UpdateTransactionDrawerSheet({
  accounts,
  categories,
  transaction,
  ...props
}: UpdateTransactionDrawerSheetProps) {
  const isMobile = useIsMobile();

  if (!transaction) return;

  const DrawerSheetContent = () => (
    <UpdateTransactionForm
      className={cn({ "px-4": isMobile })}
      accounts={accounts}
      categories={categories}
      transaction={transaction}
      onComplete={() => props.onOpenChange?.(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer {...props}>
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
    <Sheet {...props}>
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
