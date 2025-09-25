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
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createManualBankAccountSchema } from "~/shared/validators/bank-account.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  period: z.string(),
  type: z.string(),
});

type Props = {
  period?: "month";
  type?: "gross" | "net";
};

export function IncomeWidgetSettingsForm({ period, type }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateDashboardPreferencesMutation = useMutation(
    trpc.dashboardPreferences.update.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (_data) => {
        toast.success("Bank Account created");
      },
    }),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      period: period ?? "month",
      type: type ?? "gross",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    updateDashboardPreferencesMutation.mutate(data);
  };

  const onError = (errors: typeof form.formState.errors) => {
    // raccogli tutti i messaggi di errore
    const messages = Object.values(errors).map((err) => err?.message);

    messages.forEach((msg) => {
      if (msg) toast.error(msg);
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, onError)}
        className="flex w-full flex-col gap-4"
      >
        <div className="flex w-full flex-col gap-2">
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full" size="sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gross">Gross</SelectItem>
                    <SelectItem value="net">Net</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* <div className="w-full">
          <SubmitButton
            isSubmitting={updateDashboardPreferencesMutation.isPending}
            className="w-full"
          >
            Create
          </SubmitButton>
        </div> */}
      </form>
    </Form>
  );
}
