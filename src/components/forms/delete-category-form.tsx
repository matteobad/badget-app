"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { deleteCategorySchema } from "~/lib/validators";
import { deleteCategoryAction } from "~/server/actions/insert-category-action";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

export function DeleteCategoryForm({ id }: { id: string }) {
  const deleteAction = useAction(deleteCategoryAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      // TODO: close sheet
      toast.success("Categoria eliminata!", {
        duration: 3500,
      });
    },
  });

  const form = useForm<z.infer<typeof deleteCategorySchema>>({
    resolver: zodResolver(deleteCategorySchema),
    mode: "onChange",
    defaultValues: {
      categoryId: Number(id),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(deleteAction.execute)}
        className="flex flex-col space-y-4"
      >
        <div>TODO FORM</div>
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={deleteAction.status === "executing"}>
            {deleteAction.status === "executing" ? (
              <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
            ) : (
              "Salva"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
