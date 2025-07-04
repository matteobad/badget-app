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
import { BUDGET_PERIOD } from "~/server/db/schema/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createBudgetSchema } from "~/shared/validators/budget.schema";
import { endOfMonth, startOfDay, startOfMonth } from "date-fns";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";

export default function CreateBudgetForm({
  className,
}: React.ComponentProps<"form">) {
  const { setParams } = useBudgetParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.budget.createBudget.mutationOptions({
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
      period: BUDGET_PERIOD.MONTHLY,
      dateRange: {
        from: startOfMonth(new Date()),
        to: startOfDay(endOfMonth(new Date())),
      },
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

        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="dateRange"
            render={({ field }) => (
              <FormItem className="grid gap-3">
                <FormLabel>Periodo</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          id="dates"
                          className="w-full justify-between font-normal"
                        >
                          {field.value?.from && field.value?.to
                            ? `${field.value.from.toLocaleDateString()} - ${field.value.to.toLocaleDateString()}`
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="flex w-auto overflow-hidden p-0"
                        align="end"
                      >
                        <div className="p-1">
                          <Calendar
                            mode="range"
                            selected={field.value}
                            captionLayout="dropdown"
                            onSelect={(range) => {
                              field.onChange(range);
                            }}
                          />
                        </div>

                        <div className="no-scrollbar inset-y-0 right-0 flex max-h-72 w-full scroll-pb-6 flex-col gap-4 overflow-y-auto border-t p-4 md:max-h-none md:w-48 md:border-t-0 md:border-l">
                          <div className="grid gap-2">
                            {/* <Label className="">Time frame</Label> */}
                            {Object.values(BUDGET_PERIOD).map((period) => (
                              <Button
                                key={period}
                                size="sm"
                                variant="outline"
                                onClick={() => field.onChange(period)}
                                className="w-full capitalize shadow-none"
                              >
                                {period}
                              </Button>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <Label>Recurring</Label>
                            <Switch />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // close modal
              void setParams(null);
            }}
          >
            Annulla
          </Button>
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
