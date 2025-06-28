"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { PencilIcon } from "lucide-react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import UpdateCategoryForm from "./update-category-form";

export default function UpdateCategoryDialog({
  categoryId,
}: {
  categoryId: string;
}) {
  const [open, setOpen] = useState(false);

  const trpc = useTRPC();

  const { data: category } = useQuery(
    trpc.category.getById.queryOptions(
      { id: categoryId },
      { enabled: !!categoryId },
    ),
  );

  const closeModal = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-4 text-neutral-300">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Modifica categoria</DialogTitle>
          <DialogDescription className="sr-only">
            Ogni euro ha la sua storia: crea categorie e organizza le tue
            finanze.
          </DialogDescription>
        </DialogHeader>

        {!!category && (
          <UpdateCategoryForm category={category} onComplete={closeModal} />
        )}
      </DialogContent>
    </Dialog>
  );
}
