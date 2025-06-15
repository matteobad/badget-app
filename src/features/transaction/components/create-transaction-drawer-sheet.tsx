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

import CreateTransactionForm from "./create-transaction-form";

interface CreateTransactionDrawerSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
}

export default function CreateTransactionDrawerSheet({
  accounts,
  categories,
  ...props
}: CreateTransactionDrawerSheetProps) {
  const isMobile = useIsMobile();

  const DrawerSheetContent = () => (
    <CreateTransactionForm
      className={cn({ "px-4": isMobile })}
      accounts={accounts}
      categories={categories}
      onComplete={() => props.onOpenChange?.(false)}
    />
  );

  if (isMobile) {
    return (
      <Drawer {...props}>
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
    <Sheet {...props}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Nuova spesa o entrata</SheetTitle>
            <SheetDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>
          <DrawerSheetContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
