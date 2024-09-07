import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createBankAccountSchema } from "~/lib/validators";
import { createBankAccountAction } from "~/server/actions/bank-account.action";

export function CreateCategoryForm() {
  const router = useRouter();

  const { execute, isExecuting } = useAction(createBankAccountAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      const bankAccountId = data![0]?.id;
      toast.success("Conto creato!");
      router.push(`/onboarding?step=banking&account_ids=${bankAccountId}`);
    },
  });

  const form = useForm<z.infer<typeof createBankAccountSchema>>({
    resolver: zodResolver(createBankAccountSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      balance: "0",
      currency: "EUR",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(execute)} className="flex flex-col">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 items-center gap-2">
              <FormLabel>Nome</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Satispay" {...field} className="!mt-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 items-center gap-2">
              <FormLabel>Saldo</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="1.000,00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 items-center gap-2">
              <FormLabel>Valuta</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="€" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            disabled={!form.formState.isValid || isExecuting}
          >
            Crea Conto
          </Button>
        </div>
      </form>
    </Form>
  );
}
