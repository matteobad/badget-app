import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CurrencyInput } from "~/components/custom/currency-input";
import { SubmitButton } from "~/components/submit-button";
import {
  Form,
  FormControl,
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
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { ACCOUNT_TYPE } from "~/shared/constants/enum";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createBankAccountSchema } from "~/shared/validators/bank-account.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod/v4";

// import { createAccountAction } from "../server/actions";
// import { AccountInsertSchema } from "../utils/schemas";
// import { AccountTypePicker } from "./account-type-picker";

export default function CreateBankAccountForm() {
  const { setParams } = useBankAccountParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createBankAccountMutation = useMutation(
    trpc.bankAccount.create.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (_data) => {
        toast.success("Bank Account created");
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
        form.reset();
        void setParams({ createBankAccount: null });
      },
    }),
  );

  const form = useForm<z.infer<typeof createBankAccountSchema>>({
    resolver: standardSchemaResolver(createBankAccountSchema),
    defaultValues: {
      currency: "EUR",
    },
  });

  const handleSubmit = (data: z.infer<typeof createBankAccountSchema>) => {
    const formattedData = {
      ...data,
    };

    createBankAccountMutation.mutate(formattedData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex h-full flex-col gap-4"
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid w-full grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Nome account</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder=""
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Tipologia</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipologia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ACCOUNT_TYPE).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Importo</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Valuta</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona valuta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="w-full">
          <SubmitButton
            isSubmitting={createBankAccountMutation.isPending}
            className="w-full"
          >
            Create
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
}
