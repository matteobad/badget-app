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
import { useCategoryParams } from "~/hooks/use-category-params";
import { useIsMobile } from "~/hooks/use-mobile";

import CreateCategoryForm from "../../features/category/components/create-category-form";

export default function CreateCategoryDrawerSheet() {
  const isMobile = useIsMobile();
  const { params, setParams } = useCategoryParams();

  const isOpen = !!params.createCategory;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={() => setParams(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Crea una nuova categoria</DrawerTitle>
            <DrawerDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </DrawerDescription>
          </DrawerHeader>
          <CreateCategoryForm className="px-4" />
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
    <Sheet open={isOpen} onOpenChange={() => setParams(null)}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Crea una nuova categoria</SheetTitle>
            <SheetDescription>
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </SheetDescription>
          </SheetHeader>
          <CreateCategoryForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
