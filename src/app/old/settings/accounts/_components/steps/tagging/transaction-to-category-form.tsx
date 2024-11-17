"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, ChevronsUpDown } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { updateTransactionCategoryBulkSchema } from "~/lib/validators";
import { updateTransactionCategoryBulkAction } from "~/server/actions/bank-transaction-action";
import {
  type getFilteredTransactions,
  type getUserCategories,
  type getUserTransactions,
} from "~/server/db/queries/cached-queries";
import { ChangeStepButton } from "../change-step-button";

export function TransactionToCategoryForm({
  categories,
  transactions,
}: {
  categories: Awaited<ReturnType<typeof getUserCategories>>;
  transactions: Awaited<ReturnType<typeof getFilteredTransactions>>["data"];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const action = useAction(updateTransactionCategoryBulkAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      const params = new URLSearchParams(searchParams);
      params.delete("ref");
      params.delete("provider");
      params.set("step", "success");
      router.replace(`${pathname}?${params.toString()}`);
    },
  });

  const form = useForm<z.infer<typeof updateTransactionCategoryBulkSchema>>({
    resolver: zodResolver(updateTransactionCategoryBulkSchema),
    mode: "onChange",
    defaultValues: {
      transactions,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(action.execute)}
        className="scrollbar-hide relative flex h-full flex-col space-y-6 overflow-auto"
      >
        <div className="flex-1">
          {transactions.slice(0, 5).map((transation, index) => (
            <FormField
              key={transation.id}
              control={form.control}
              name="transactions"
              render={({ field }) => {
                return (
                  <div className="flex items-end justify-between gap-4">
                    <FormItem
                      key={transation.id}
                      className="flex w-full grow flex-col"
                    >
                      <FormLabel className={cn({ "sr-only": index !== 0 })}>
                        Transazione
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="shadcn"
                          {...field}
                          value={
                            field.value.find(
                              (value) => value.id === transation.id,
                            )?.description ?? ""
                          }
                          onChange={(event) => {
                            return field.onChange(
                              field.value.map((value) => {
                                if (value.id === transation.id) {
                                  return {
                                    ...value,
                                    description: event.target.value,
                                  };
                                }

                                return value;
                              }),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <ArrowRight className="mb-3 size-4 shrink-0" />
                    <FormItem className="flex w-full grow flex-col">
                      <FormLabel className={cn({ "sr-only": index !== 0 })}>
                        Categoria
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? categories.find(
                                    (category) =>
                                      category.id ===
                                      field.value[index]?.categoryId,
                                  )?.name
                                : "Seleziona categoria"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Cerca categoria..." />
                            <CommandList>
                              <CommandEmpty>
                                Categoria non trovata.
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    value={category.id.toString()}
                                    key={category.id}
                                    onSelect={() => {
                                      const newValue = field.value.map(
                                        (value) => {
                                          if (value.id === transation.id) {
                                            return {
                                              ...value,
                                              categoryId: category.id,
                                            };
                                          }

                                          return value;
                                        },
                                      );

                                      form.setValue("transactions", newValue);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        category.id ===
                                          field.value[index]?.categoryId
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  </div>
                );
              }}
            />
          ))}
        </div>

        <div className="flex w-full justify-end gap-4">
          <ChangeStepButton step="success" label="skip" />
          <ChangeStepButton step="connect" label="annulla" />
          <Button type="submit" disabled={!form.formState.isValid}>
            Salva
          </Button>
        </div>
      </form>
    </Form>
  );
}
