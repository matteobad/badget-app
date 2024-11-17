"use client";

import { parseAsString, useQueryState } from "nuqs";

import { Category } from "~/app/old/banking/transactions/_components/transactions-table";
import { AddCategoryForm } from "../forms/add-category-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function AddCategoryModal({ categories }: { categories: Category[] }) {
  const [step, setStep] = useQueryState("step", parseAsString);

  const isOpen = step === "insert";

  const onClose = () => {
    void setStep(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Crea una categoria</DialogTitle>
          <DialogDescription>
            Crea una nuova categoria per tracciare meglio le tue spese
          </DialogDescription>
        </DialogHeader>
        <AddCategoryForm categories={categories} />
      </DialogContent>
    </Dialog>
  );
}
