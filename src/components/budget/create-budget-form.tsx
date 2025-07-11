import type { z } from "zod/v4";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useBudgetParams } from "~/hooks/use-budget-params";
import { cn } from "~/lib/utils";
import { BUDGET_PERIOD, BUDGET_RECURRENCE } from "~/server/db/schema/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createBudgetSchema } from "~/shared/validators/budget.schema";
import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";

import { CurrencyInput } from "../custom/currency-input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";

export default function CreateBudgetForm({
  className,
}: React.ComponentProps<"form">) {
  const { setParams } = useBudgetParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.budget.create.mutationOptions({
      onSuccess: (_data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.budget.getBudgetWarnings.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.category.getFlatTree.queryKey(),
        });

        // reset form
        form.reset();

        // TODO: navigate to next form
        void setParams(null);
      },
    }),
  );

  const form = useForm<z.infer<typeof createBudgetSchema>>({
    resolver: standardSchemaResolver(createBudgetSchema),
    defaultValues: {
      recurrence: BUDGET_RECURRENCE.MONTHLY,
      from: startOfMonth(new Date()),
      repeat: false,
      amount: 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof createBudgetSchema>) => {
    const formattedData = {
      ...data,
    };

    createMutation.mutate(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>From</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-from"
                        className="w-full justify-between font-normal ring-inset"
                      >
                        {field.value
                          ? field.value.toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>To</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-from"
                        className="w-full justify-between font-normal ring-inset"
                      >
                        {field.value
                          ? field.value.toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <CurrencyInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repeat"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Repeat</FormLabel>
                <FormControl>
                  <Switch
                    onCheckedChange={field.onChange}
                    checked={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Creo categoria...
              </>
            ) : (
              "Salva"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
