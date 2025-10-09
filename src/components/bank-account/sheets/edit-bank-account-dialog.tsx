"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import type z from "zod";
import { CurrencyInput } from "~/components/custom/currency-input";
import { SubmitButton } from "~/components/submit-button";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { updateBankAccountBalanceSchema } from "~/shared/validators/bank-account.schema";

type Props = {
  id: string;
  onOpenChange: (isOpen: boolean) => void;
  isOpen: boolean;
  defaultValue: {
    balance: number;
    date: string;
  };
};

export default function EditBankAccountDialog({
  isOpen,
  onOpenChange,
  id,
  defaultValue,
}: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateBankAccountBalanceMutation = useMutation(
    trpc.bankAccount.updateBankAccountBalance.mutationOptions({
      onSuccess: () => {
        onOpenChange(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.asset.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
      },
    }),
  );

  const form = useForm<z.infer<typeof updateBankAccountBalanceSchema>>({
    resolver: zodResolver(updateBankAccountBalanceSchema),
    defaultValues: {
      id,
      balance: defaultValue.balance,
      date: defaultValue.date,
    },
  });

  function onSubmit(values: z.infer<typeof updateBankAccountBalanceSchema>) {
    updateBankAccountBalanceMutation.mutate({
      ...values,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[455px]">
        <DialogHeader>
          <DialogTitle>Edit Balance</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2">
            <div className="flex flex-col space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Saldo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CurrencyInput
                            value={field.value}
                            onValueChange={(values) => {
                              field.onChange(values.floatValue);
                            }}
                            autoFocus
                            placeholder="1000,00"
                          />

                          <FormMessage />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal ring-inset",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={(value) => {
                              field.onChange(format(value, "yyyy-MM-dd"));
                            }}
                            disabled={(date) => date < new Date("1900-01-01")}
                            captionLayout="dropdown"
                            required // allow selecting same date
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-6 items-center !justify-between">
                <div>
                  {Object.values(form.formState.errors).length > 0 && (
                    <span className="text-sm text-destructive">
                      Please complete the fields above.
                    </span>
                  )}
                </div>
                <SubmitButton
                  isSubmitting={updateBankAccountBalanceMutation.isPending}
                >
                  Salva
                </SubmitButton>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
