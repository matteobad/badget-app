"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { useCategoryParams } from "~/hooks/use-category-params";

import { CategoryDetails } from "../category-details";

export default function CategorySheet() {
  const { params, setParams } = useCategoryParams();

  const isOpen = !!params.categoryId && !params.createCategory;

  const onOpenChange = () => {
    void setParams({ categoryId: null });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Modifica spesa o entrate</SheetTitle>
            <SheetDescription>
              Modifica un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>

          <CategoryDetails />
        </div>
      </SheetContent>
    </Sheet>
  );
}
