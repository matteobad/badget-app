"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import MoneyInput from "~/components/custom/money-input";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { updateBankAccountSchema } from "~/lib/validators";
import { updateBankAccountAction } from "~/server/actions/bank-account.action";
import { BankAccount } from "~/server/db/queries/cached-queries";

type UpdateBankAccountFormProps = {
  bankAccount: BankAccount["bankAccount"][number];
};

export function UpdateBankAccountForm({
  bankAccount,
}: UpdateBankAccountFormProps) {
  const { execute, isExecuting } = useAction(updateBankAccountAction, {
    onError: (error) => {
      toast.error(error.error.serverError);
    },
    onSuccess: () => {
      toast.success("Conto aggiornato!");
    },
  });

  const form = useForm<z.output<typeof updateBankAccountSchema>>({
    resolver: zodResolver(updateBankAccountSchema),
    defaultValues: {
      ...bankAccount,
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-2 overflow-auto"
        onSubmit={form.handleSubmit(execute)}
      >
        <FormField
          control={form.control}
          name="id"
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
              <FormLabel>Nome del conto</FormLabel>
              <FormControl>
                <Input placeholder="Satispay" {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-start justify-between gap-4">
          <MoneyInput
            form={form}
            label="Saldo Corrente"
            name="balance"
            placeholder="10.000,00"
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valuta</FormLabel>
                <FormControl>
                  <Input placeholder="EUR" {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6 flex gap-4 self-end">
          <Button
            type="submit"
            disabled={isExecuting || !form.formState.isDirty}
          >
            Aggiorna
          </Button>
        </div>
      </form>
    </Form>
  );
}
