"use client";

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
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { categoriesParsers } from "../utils/search-params";
import UpdateCategoryForm from "./update-category-form";

export default function UpdateCategoryDrawerSheet({
  categories,
}: {
  categories: DB_CategoryType[];
}) {
  const isMobile = useIsMobile();
  const [{ id }, setParams] = useQueryStates(categoriesParsers);

  const open = !!id;
  const category = categories.find((c) => c.id === id)!;

  const handleClose = () => {
    void setParams({ id: null });
  };

  if (!id) return;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Modifica categoria</DrawerTitle>
            <DrawerDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </DrawerDescription>
          </DrawerHeader>
          <UpdateCategoryForm
            className="px-4"
            categories={categories}
            category={category}
            onComplete={handleClose}
          />
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
          <SheetHeader>
            <SheetTitle>Modifica categoria</SheetTitle>
            <SheetDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </SheetDescription>
          </SheetHeader>
          <UpdateCategoryForm
            categories={categories}
            category={category}
            onComplete={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
