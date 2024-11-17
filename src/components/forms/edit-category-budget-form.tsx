"use client";

import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { type Category } from "~/app/old/banking/transactions/_components/transactions-table";
import { cn } from "~/lib/utils";
import { upsertCategoryBudgetSchema } from "~/lib/validators";
import {
  deleteCategoryAction,
  upsertCategoryBudgetAction,
} from "~/server/actions/insert-category-action";
import { BudgetPeriod } from "~/server/db/schema/enum";
import MoneyInput from "../custom/money-input";
import MonthPicker from "../month-picker";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type EditCategoryBudgetFormProps = {
  categoryId: string;
  budgets: Category["budgets"];
};

export function EditCategoryBudgetForm({
  categoryId,
  budgets,
}: EditCategoryBudgetFormProps) {
  const upsertAction = useAction(upsertCategoryBudgetAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      // TODO: close sheet
      toast.success("Budget aggiornato!", {
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

  const form = useForm<z.infer<typeof upsertCategoryBudgetSchema>>({
    resolver: zodResolver(upsertCategoryBudgetSchema),
    mode: "onChange",
    defaultValues: {
      budgets,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(upsertAction.execute)}
        className="flex flex-col space-y-4"
      >
        {budgets.map((_budget, index) => {
          return (
            <div className="flex flex-col gap-2" key={index}>
              <div className="flex items-end gap-4" key={index}>
                <FormField
                  control={form.control}
                  name={`budgets.${index}.categoryId`}
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
                          {Object.values(BudgetPeriod).map((period, index) => {
                            return (
                              <SelectItem value={period} key={index}>
                                {period}
                              </SelectItem>
                            );
                          })}
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
                  initialValue={budgets[index]?.budget.toString() ?? "0"}
                />
              </div>
              <FormField
                control={form.control}
                name={`budgets.${index}.activeFrom`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Valido dal</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy")
                          ) : (
                            <span>Seleziona una data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                        <Select
                          onValueChange={(_value) => {
                            const parsedDate = new Date(); // TODO: parse user choice into date
                            field.onChange(parsedDate);
                            form.setValue(
                              `budgets.${index}.activeFrom`,
                              parsedDate,
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="0">Today</SelectItem>
                            <SelectItem value="1">Tomorrow</SelectItem>
                            <SelectItem value="3">In 3 days</SelectItem>
                            <SelectItem value="7">In a week</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="rounded-md border">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          );
        })}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              upsertAction.status === "executing" || upsertAction.isExecuting
            }
          >
            {upsertAction.status === "executing" ? (
              <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
            ) : (
              "Salva budgets"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
