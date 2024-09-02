"use client";

import { useRouter } from "next/navigation";
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
import { useConnectParams } from "~/hooks/use-connect-params";
import { createBankAccountSchema } from "~/lib/validators";
import { createBankAccountAction } from "~/server/actions/bank-account.action";

export function CreateAccountForm() {
  const router = useRouter();

  const { setParams } = useConnectParams();

  const { execute, isExecuting } = useAction(createBankAccountAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      router.push("/");
      toast.error("Conto creato!", {
        duration: 3500,
      });
    },
  });

  const form = useForm<z.output<typeof createBankAccountSchema>>({
    resolver: zodResolver(createBankAccountSchema),
    defaultValues: {
      currency: "EUR",
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col items-start">
        <h2 className="text-xl font-semibold">Create Account</h2>
        <p className="text-sm text-slate-500">Breve descrizione dello step</p>
      </header>

      <Form {...form}>
        <form
          className="flex w-full max-w-2xl flex-1 flex-col justify-center gap-2 overflow-auto"
          onSubmit={form.handleSubmit(execute)}
        >
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
              type="button"
              variant="outline"
              onClick={() => {
                void setParams({ step: "select-connection" });
              }}
            >
              Torna indietro
            </Button>
            <Button disabled={isExecuting}>Crea Conto</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
