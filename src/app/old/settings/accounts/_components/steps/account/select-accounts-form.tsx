"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

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
import { connectAccountSchema } from "~/lib/validators";
import { connectAccountAction } from "~/server/actions/connect-bank-account-action";
import { type getAccounts } from "~/server/actions/institutions/get-accounts";
import { Provider } from "~/server/db/schema/enum";
import { ChangeStepButton } from "../change-step-button";

export function SelectAccountsForm({
  accounts,
  reference,
}: {
  accounts: Awaited<ReturnType<typeof getAccounts>>;
  provider: Provider;
  reference: string;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const action = useAction(connectAccountAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      const params = new URLSearchParams(searchParams);
      params.set("step", "tagging");
      router.replace(`${pathname}?${params.toString()}`);
    },
  });

  const form = useForm<z.infer<typeof connectAccountSchema>>({
    resolver: zodResolver(connectAccountSchema),
    mode: "onChange",
    defaultValues: {
      provider: Provider.GOCARDLESS,
      reference,
      accountIds: accounts.map((a) => a.id),
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(action.execute)}
        className="scrollbar-hide relative flex h-full flex-col space-y-6 overflow-auto"
      >
        <div className="flex-1">
          {accounts.map((account) => (
            <FormField
              key={account.id}
              control={form.control}
              name="accountIds"
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
                        checked={field.value.some(
                          (value) => value === account.id,
                        )}
                        onCheckedChange={(checked) => {
                          let newValue: string[] = [];
                          if (checked) newValue = [...field.value, account.id];
                          else
                            newValue = field.value.filter(
                              (id) => id !== account.id,
                            );
                          form.setValue("accountIds", newValue);
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
          <Button
            type="submit"
            disabled={!form.formState.isValid || action.isExecuting}
          >
            Salva
          </Button>
        </div>
      </form>
    </Form>
  );
}
