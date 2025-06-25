"use client";

import { useCategoryParams } from "~/hooks/use-category-params";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import UpdateCategoryForm from "./update-category-form";

export default function UpdateCategoryDialog() {
  const { params: categoryParams, setParams: setCategoryParams } =
    useCategoryParams();

  const isOpen = !!categoryParams.categoryId;

  const onOpenChange = () => {
    void setCategoryParams(null);
  };

  const UpdateForm = () =>
    categoryParams.categoryId && (
      <UpdateCategoryForm categoryId={categoryParams.categoryId} />
    );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-4 [&>button]:hidden">
        <div className="flex h-full flex-col">
          <DialogHeader>
            <DialogTitle>Modifica categoria</DialogTitle>
            <DialogDescription className="sr-only">
              Ogni euro ha la sua storia: crea categorie e organizza le tue
              finanze.
            </DialogDescription>
          </DialogHeader>
          {/* <UpdateForm /> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
