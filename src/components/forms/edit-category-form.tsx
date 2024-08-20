"use client";

import type dynamicIconImports from "lucide-react/dynamicIconImports";
import type z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Category } from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { cn } from "~/lib/utils";
import { upsertCategorySchema } from "~/lib/validators";
import {
  deleteCategoryAction,
  insertCategoryAction,
} from "~/server/actions/insert-category-action";
import { BudgetPeriod, CategoryType } from "~/server/db/schema/enum";
import { InputColor } from "../color-input";
import MoneyInput from "../custom/money-input";
import Icon from "../icons";
import MonthPicker from "../month-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CATEGORY_ICONS = ["link"] as const;

export function EditCategoryForm({
  id,
  categories,
}: {
  id: string;
  categories: Category[];
}) {
  const [macroSearch, setMacroSearch] = useState("");

  const macros = categories.map((category) => category.macro);
  const category = categories.find((c) => c.id.toString() === id);

  const { execute, status } = useAction(insertCategoryAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      // TODO: close sheet
      toast.success("Categoria creata!", {
        duration: 3500,
      });
    },
  });

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

  const form = useForm<z.infer<typeof upsertCategorySchema>>({
    resolver: zodResolver(upsertCategorySchema),
    mode: "onChange",
    defaultValues: {
      ...category,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className="flex flex-col space-y-4"
      >
        <div className="flex items-end">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild className="flex">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-r-none"
                      >
                        <Icon
                          name={field.value as keyof typeof dynamicIconImports}
                          className="h-4 w-4"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Icone</h4>
                          <p className="text-sm text-muted-foreground">
                            Seleziona l&apos;icona che meglio rappresenta la tua
                            categoria
                          </p>
                        </div>
                        <div className="grid gap-4">
                          {CATEGORY_ICONS.map((icon, index) => {
                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="icon"
                                onClick={() => form.setValue("icon", icon)}
                              >
                                <Icon name={icon} className="h-4 w-4" />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="-ml-10">Nome della categoria</FormLabel>
                <FormControl>
                  <InputColor
                    autoFocus
                    placeholder="Viaggi"
                    onChange={({ name, color }) => {
                      field.onChange(name);
                      form.setValue("color", color);
                    }}
                    defaultValue={field.value}
                    defaultColor={form.watch("color")}
                  />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-end gap-4">
          <FormField
            control={form.control}
            name="macro"
            render={({ field }) => (
              <FormItem className="flex-1 flex-col">
                <FormLabel>Macro Categoria</FormLabel>
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
                        {field.value || "Seleziona gruppo"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Cerca gruppo..."
                        onValueChange={setMacroSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <Button
                            className="w-full"
                            variant="ghost"
                            onClick={() => form.setValue("macro", macroSearch)}
                          >
                            Crea '{macroSearch}'
                          </Button>
                        </CommandEmpty>
                        <CommandGroup>
                          {macros.map((macro) => (
                            <CommandItem
                              value={macro}
                              key={macro}
                              onSelect={() => {
                                form.setValue("macro", macro);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  macro === field.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {macro}
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Outcome" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(CategoryType).map((type, index) => {
                      return (
                        <SelectItem value={type} key={index}>
                          {type}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Budgets</AccordionTrigger>
            <AccordionContent>
              {category?.budgets.map((_budget, index) => {
                return (
                  <div className="flex items-end gap-4" key={index}>
                    <FormField
                      control={form.control}
                      name={`budgets.${index}.activeFrom`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Da</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                {format(field.value, "LLL yyyy")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60" align="start">
                              <MonthPicker
                                currentMonth={field.value}
                                onMonthChange={(from) => {
                                  field.onChange(from);
                                  form.setValue(
                                    `budgets.${index}.activeFrom`,
                                    from,
                                  );
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`budgets.${index}.period`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Periodo</FormLabel>
                          <Select
                            onValueChange={(period) => {
                              field.onChange(period);
                              form.setValue(`budgets.${index}.period`, period);
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleziona un periodo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(BudgetPeriod).map(
                                (period, index) => {
                                  return (
                                    <SelectItem value={period} key={index}>
                                      {period}
                                    </SelectItem>
                                  );
                                },
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <MoneyInput
                      form={form}
                      label="Budget"
                      name={`budgets.${index}.budget`}
                      placeholder="100"
                    />
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Danger Zone</AccordionTrigger>
            <AccordionContent>
              <Button
                variant="destructive"
                onClick={() => deleteAction.execute({ categoryId: Number(id) })}
              >
                Elimina Categoria
              </Button>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  );
}
