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
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { useQueryStates } from "nuqs";

import { categoriesParsers } from "../utils/search-params";
import CreateCategoryForm from "./create-category-form";

export default function CreateCategoryDrawerSheet({
  categories,
}: {
  categories: DB_CategoryType[];
}) {
  const isMobile = useIsMobile();
  const [{ add }, setParams] = useQueryStates(categoriesParsers);

  const open = !!add;

  const handleClose = () => {
    void setParams({ add: null });
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Crea una nuova categoria</DrawerTitle>
            <DrawerDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </DrawerDescription>
          </DrawerHeader>
          <CreateCategoryForm
            className="px-4"
            categories={categories}
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
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Crea una nuova categoria</SheetTitle>
            <SheetDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </SheetDescription>
          </SheetHeader>
          <CreateCategoryForm
            categories={categories}
            onComplete={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
