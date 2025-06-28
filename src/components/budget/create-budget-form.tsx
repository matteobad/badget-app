import type { DateRange } from "react-day-picker";
import type { z } from "zod/v4";
import { useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function CreateBudgetForm({
  className,
}: React.ComponentProps<"form">) {
  const [range, setRange] = useState<DateRange | undefined>(undefined);

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
                          className="w-56 justify-between font-normal"
                        >
                          {field.value?.from && field.value?.to
                            ? `${field.value.from.toLocaleDateString()} - ${field.value.to.toLocaleDateString()}`
                            : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="range"
                          selected={field.value}
                          captionLayout="dropdown"
                          onSelect={(range) => {
                            field.onChange(range);
                          }}
                        />
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
