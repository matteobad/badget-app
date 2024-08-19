"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "~/lib/utils";
import { editBankTransactionSchema } from "~/lib/validators";
import { editBankTransactionAction } from "~/server/actions/bank-transaction-action";
import { getUserCategories } from "~/server/db/queries/cached-queries";
import Icon from "../icons";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type EditTransactionCategoryFormProps = {
  categories: Awaited<ReturnType<typeof getUserCategories>>;
};

export function EditTransactionCategoryForm({
  categories,
}: EditTransactionCategoryFormProps) {
  const form = useForm<z.infer<typeof editBankTransactionSchema>>({
    resolver: zodResolver(editBankTransactionSchema),
  });

  const { execute, status } = useAction(editBankTransactionAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(execute)} className="mt-4 space-y-6">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Categoria</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value
                        ? categories
                            .filter((category) => category.id === field.value)
                            .map((selectedCategory) => {
                              return (
                                <div className="flex items-center gap-2">
                                  <Icon
                                    className="h-4 w-4"
                                    name={
                                      selectedCategory.icon as keyof typeof dynamicIconImports
                                    }
                                  />
                                  <span>{selectedCategory.name}</span>
                                </div>
                              );
                            })
                        : "Seleziona una categoria"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[335px] p-0">
                  <Command>
                    <CommandInput placeholder="Cerca categoria..." />
                    <CommandList>
                      <CommandEmpty>Categoria non trovata</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            className="justify-between"
                            value={category.name}
                            key={category.id}
                            onSelect={() => {
                              form.setValue("categoryId", category.id);
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                className="h-4 w-4"
                                name={
                                  category.icon as keyof typeof dynamicIconImports
                                }
                              />
                              <span>{category.name}</span>
                            </div>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                category.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
