"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";

import { Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { upsertCategorySchema } from "~/lib/validators";
import { CategoryType } from "~/server/db/schema/enum";
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

  const form = useForm<z.infer<typeof upsertCategorySchema>>({
    resolver: zodResolver(upsertCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      macro: CategoryType.OUTCOME.toLowerCase(),
      type: CategoryType.OUTCOME,
      icon: "circle-dashed",
    },
  });

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
