"use client";

import { useTransactionCategoryParams } from "~/hooks/use-transaction-category-params";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import CreateCategoryForm from "../forms/create-category-form";

export default function CreateCategoryDialog() {
  const { params: categoryParams, setParams: setCategoryParams } =
    useTransactionCategoryParams();

  const isOpen = !!categoryParams.createCategory;

  const onOpenChange = () => {
    void setCategoryParams(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex h-full flex-col">
          <DialogHeader className="mb-6">
            <DialogTitle>Nuova categoria</DialogTitle>
          </DialogHeader>

          <CreateCategoryForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
