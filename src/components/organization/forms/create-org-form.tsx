"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CountrySelector } from "~/components/country-selector";
import { SelectCurrency } from "~/components/select-currency";
import { SubmitButton } from "~/components/submit-button";
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
import { uniqueCurrencies } from "~/shared/constants/currencies";
import { useSession } from "~/shared/helpers/better-auth/auth-client";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
  countryCode: z.string(),
  baseCurrency: z.string(),
});

type Props = {
  defaultCurrencyPromise: Promise<string>;
  defaultCountryCodePromise: Promise<string>;
};

export function CreateSpaceForm({
  defaultCurrencyPromise,
  defaultCountryCodePromise,
}: Props) {
  const currency = use(defaultCurrencyPromise);
  const countryCode = use(defaultCountryCodePromise);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data } = useSession();
  const name = data?.user.name;

  const createOrganizationMutation = useMutation(
    trpc.organization.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries();
        router.push("/overview");
      },
    }),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      baseCurrency: currency,
      countryCode: countryCode ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createOrganizationMutation.mutate({
      name: values.name,
      baseCurrency: values.baseCurrency,
      countryCode: values.countryCode,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mt-4 w-full">
              <FormLabel className="text-xs font-normal text-[#666]">
                Space name
              </FormLabel>
              <FormControl>
                <Input
                  autoFocus
                  placeholder={`Ex: ${name}'s Family`}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem className="mt-4 w-full">
              <FormLabel className="text-xs font-normal text-[#666]">
                Country
              </FormLabel>
              <FormControl className="w-full">
                <CountrySelector
                  defaultValue={field.value ?? ""}
                  onSelect={(code, name) => {
                    field.onChange(name);
                    form.setValue("countryCode", code);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseCurrency"
          render={({ field }) => (
            <FormItem className="mt-4 border-b border-border pb-4">
              <FormLabel className="text-xs font-normal text-[#666]">
                Base currency
              </FormLabel>
              <FormControl>
                <SelectCurrency currencies={uniqueCurrencies} {...field} />
              </FormControl>

              <FormDescription>
                If you have multiple accounts in different currencies, this will
                be the default currency for your company. You can change it
                later.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          className="mt-6 w-full"
          type="submit"
          isSubmitting={createOrganizationMutation.isPending}
        >
          Create
        </SubmitButton>
      </form>
    </Form>
  );
}
