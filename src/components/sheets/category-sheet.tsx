"use client";

import { Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { useMediaQuery } from "~/hooks/use-media-query";
import { CategoryDetails } from "../category-details";
import { Drawer, DrawerContent } from "../ui/drawer";
import { Sheet, SheetContent } from "../ui/sheet";

type CategorySheetProps = {
  setOpen: (open: string) => void;
  isOpen: boolean;
  id: string | null;
  categories: Category[];
};

export function CategorySheet({
  setOpen,
  isOpen,
  id,
  categories,
}: CategorySheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!id) return <></>;

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={() => setOpen("")}>
        <SheetContent className="bottom-4 right-4 top-4 h-auto rounded">
          <CategoryDetails id={id} categories={categories} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={() => setOpen("")}>
      <DrawerContent className="p-6">
        <CategoryDetails id={id} categories={categories} />
      </DrawerContent>
    </Drawer>
  );
}
