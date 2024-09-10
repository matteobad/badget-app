import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { createBankAccountSchema } from "~/lib/validators";
import { createBankAccountAction } from "~/server/actions/bank-account.action";

export function CreateAccountForm() {
  const router = useRouter();

  const { execute, isExecuting } = useAction(createBankAccountAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      const bankAccountId = data![0]?.id;
      toast.success("Conto creato!");
      router.push(
        `/onboarding?step=banking-accounts&account_ids=${bankAccountId}`,
      );
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
      <form
        onSubmit={form.handleSubmit(execute)}
        className="flex flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-3 items-center gap-2">
              <FormLabel className="text-slate-500">Nome</FormLabel>
              <FormControl className="col-span-2">
                <Input placeholder="Satispay" {...field} className="!mt-0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 items-center gap-2">
          <FormLabel className="text-slate-500">Saldo</FormLabel>

          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-1 pt-2">
          <Button
            className="w-full"
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
