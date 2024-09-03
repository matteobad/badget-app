"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import type { Provider } from "~/server/db/schema/enum";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { euroFormat, getInitials } from "~/lib/utils";
import {
  selectBankAccountsSchema,
  upsertBankConnectionSchema,
} from "~/lib/validators";
import { connectBankAccountAction } from "~/server/actions/connect-bank-account-action";
import { type getAccounts } from "~/server/actions/institutions/get-accounts";
import { BankAccountType, ConnectionStatus } from "~/server/db/schema/enum";
import { getAccessValidForDays } from "~/server/providers/gocardless/utils";
import { ChangeStepButton } from "../change-step-button";

export function SelectAccountsForm({
  accounts,
}: {
  accounts: Awaited<ReturnType<typeof getAccounts>>;
  provider: Provider;
  reference: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // const account = accounts.at(0);

  // // NOTE: GoCardLess connection expires after 90-180 days
  // const expiresAt =
  //   provider === Provider.GOCARDLESS
  //     ? addDays(
  //         new Date(),
  //         getAccessValidForDays({
  //           institutionId: account?.institution_id ?? "",
  //         }),
  //       )
  //     : undefined;

  // const connectBankAction = useAction(connectBankAccountAction, {
  //   onError: () => {
  //     toast.error("Something went wrong please try again.", {
  //       duration: 3500,
  //     });
  //   },
  //   onSuccess: () => {
  //     // setActiveTab("loading");
  //   },
  // });

  const form = useForm<z.infer<typeof selectBankAccountsSchema>>({
    resolver: zodResolver(selectBankAccountsSchema),
    mode: "onChange",
    defaultValues: {
      // connection: {
      //   provider: Provider.GOCARDLESS,
      //   referenceId: reference,
      //   name: accounts[0]?.institution.name,
      //   status: ConnectionStatus.CONNECTED,
      //   expiresAt,
      //   userId: "user_id_placeholder", // TODO: fine tune zod schema
      // },
      accounts: accounts.map((account) => ({
        accountId: account.id,
        // balance: account.balance?.amount ?? "0",
        // currency: account.balance?.currency ?? "EUR",
        // name: account.account.name ?? "Conto Corrente",
        // institutionId: account.institution.id,
        enabled: true,
        // type: BankAccountType.DEPOSITORY,
        // userId: "user_id_placeholder", // TODO: fine tune zod schem
      })),
    },
  });

  const onSubmit = (data: z.infer<typeof selectBankAccountsSchema>) => {
    const enabledAccounts = data.accounts
      .filter((account) => account.enabled)
      .map((account) => account.accountId)
      .join(",");

    const params = new URLSearchParams(searchParams);
    params.set("step", "tagging");
    params.set("accounts", enabledAccounts);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="scrollbar-hide relative flex h-full flex-col space-y-6 overflow-auto"
      >
        <div className="flex-1">
          {accounts.map((account) => (
            <FormField
              key={account.id}
              control={form.control}
              name="accounts"
              render={({ field }) => {
                return (
                  <FormItem key={account.id} className="flex items-center">
                    <FormLabel className="mr-8 flex w-full items-center space-x-4">
                      <Avatar className="size-[34px]">
                        <AvatarImage src={account.institution.logo} />
                        <AvatarFallback className="text-[11px]">
                          {getInitials(account.account.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col">
                          <p className="mb-1 text-sm font-medium leading-none">
                            {account.account.displayName ??
                              account.account.name ??
                              account.institution.name}
                          </p>
                          <span className="text-xs font-normal text-[#878787]">
                            {account.account.product}
                          </span>
                        </div>

                        <span className="text-sm text-[#878787]">
                          {euroFormat(account.balance?.amount ?? 0)}
                        </span>
                      </div>
                    </FormLabel>

                    <FormControl>
                      <Switch
                        className="!mt-0"
                        checked={
                          field.value.find(
                            (value) => value.accountId === account.id,
                          )?.enabled ?? false
                        }
                        onCheckedChange={(checked) => {
                          return field.onChange(
                            field.value.map((value) => {
                              if (value.accountId === account.id) {
                                return {
                                  ...value,
                                  enabled: checked,
                                };
                              }

                              return value;
                            }),
                          );
                        }}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>

        <div className="flex w-full justify-end gap-4">
          <ChangeStepButton step="connect" label="annulla" />
          <Button type="submit" disabled={!form.formState.isValid}>
            Salva
          </Button>
        </div>
      </form>
    </Form>
  );
}
