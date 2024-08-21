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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

type DeleteCategoryFormProps = { id: string; name: string };

export function DeleteCategoryForm({ id, name }: DeleteCategoryFormProps) {
  const deleteAction = useAction(deleteCategoryAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      toast.success("Categoria eliminata!", {
        duration: 3500,
      });
    },
  });

  const form = useForm<z.infer<typeof deleteCategorySchema>>({
    resolver: zodResolver(deleteCategorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      categoryId: Number(id),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(deleteAction.execute)}
        className="flex flex-col"
      >
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Holidays" {...field} />
              </FormControl>
              <FormDescription>
                Digita '{name}' per eliminare definitivamente la categoria
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="destructive"
            disabled={
              deleteAction.status === "executing" ||
              form.getValues("name") !== name
            }
          >
            {deleteAction.status === "executing" ? (
              <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
            ) : (
              "Elimina"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
