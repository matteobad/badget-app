"use client";

import type z from "zod";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays } from "date-fns";
import { CircleCheckIcon, Loader2, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useConnectParams } from "~/hooks/use-connect-params";
import { cn, euroFormat, getInitials } from "~/lib/utils";
import { upsertBankConnectionsSchema } from "~/lib/validators";
import { connectBankAccountAction } from "~/server/actions/connect-bank-account-action";
import { importBankTransactionAction } from "~/server/actions/import-bank-transaction-action";
import { getAccounts } from "~/server/actions/institutions/get-accounts";
import {
  BankAccountType,
  ConnectionStatus,
  Provider,
} from "~/server/db/schema/enum";
import { getAccessValidForDays } from "~/server/providers/gocardless/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent } from "../ui/tabs";

function RowsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-[210px] rounded-none" />
          <Skeleton className="h-2.5 w-[180px] rounded-none" />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-[250px] rounded-none" />
          <Skeleton className="h-2.5 w-[200px] rounded-none" />
        </div>
      </div>
    </div>
  );
}

function LoadingTransactions({ bankAccountIds }: { bankAccountIds: string[] }) {
  const [loading, setLoading] = useState(true);

  const { setParams } = useConnectParams();

  const importTransactionAction = useAction(importBankTransactionAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      setLoading(false);
      void setParams({
        step: null,
        error: null,
        details: null,
        ref: null,
        provider: null,
      });
    },
  });

  useEffect(() => {
    const { hasErrored, hasSucceeded } = importTransactionAction;
    if (bankAccountIds.length > 0 && !hasErrored && !hasSucceeded) {
      importTransactionAction.execute({ bankAccountIds, latest: false });
    }
  }, [bankAccountIds]);

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-semibold leading-none tracking-tight">
        Setting up account
      </h2>

      <ul className="text-md space-y-4 text-slate-900 transition-all">
        <li
          className={cn(
            "flex items-center gap-2 opacity-50 dark:opacity-20",
            loading && "!opacity-100",
          )}
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            <CircleCheckIcon className="h-4 w-4" />
          )}
          Recupero le transazioni
        </li>
      </ul>
    </div>
  );
}

type AccountsData = NonNullable<Awaited<ReturnType<typeof getAccounts>>>;

export function SelectBankAccountsModal() {
  const [accounts, setAccounts] = useState<AccountsData>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"select-accounts" | "loading">(
    "select-accounts",
  );

  const { step, error, setParams, provider, ref, institution_id } =
    useConnectParams();

  const isOpen = step === "account";

  useEffect(() => {
    if (error) {
      // NOTE: On GoCardLess cancel flow
      void setParams({
        step: "connect",
        error: null,
        details: null,
        provider: null,
      });
    }
  }, [error, setParams]);

  const onClose = () => {
    void setParams(
      { step: null },
      {
        // NOTE: Rerender so the overview modal is visible
        shallow: false,
      },
    );
  };

  const connectBankAction = useAction(connectBankAccountAction, {
    onError: () => {
      toast.error("Something went wrong please try again.", {
        duration: 3500,
      });
    },
    onSuccess: () => {
      setActiveTab("loading");
    },
  });

  const form = useForm<z.infer<typeof upsertBankConnectionsSchema>>({
    resolver: zodResolver(upsertBankConnectionsSchema),
    mode: "onChange",
    defaultValues: {
      accounts: [],
    },
  });

  useEffect(() => {
    async function fetchData() {
      const data = await getAccounts({ id: ref! });

      setAccounts(data ?? []);
      setLoading(false);

      // Get first account to create a bank connection
      const account = data?.at(0);

      if (!account) {
        return;
      }

      // NOTE: GoCardLess connection expires after 90-180 days
      const expiresAt =
        provider === Provider.GOCARDLESS
          ? addDays(
              new Date(),
              getAccessValidForDays({ institutionId: account.institution_id }),
            )
          : undefined;

      console.log(provider, expiresAt);

      form.reset({
        provider: Provider.GOCARDLESS,
        referenceId: ref!,
        expiresAt,
        institutionId: account.institution_id,
        name: account.institution.name,
        logoUrl: account.institution.logo,
        status: ConnectionStatus.CONNECTED,
        userId: "user_id_placeholder", // TODO: fine tune zod schema
        accounts: data?.map((account) => ({
          accountId: account.id,
          balance: account.balance?.amount,
          currency: account.balance?.currency,
          name: account.account.name || "Conto Corrente",
          institutionId: account.institution.id,
          enabled: true,
          type: BankAccountType.DEPOSITORY,
          userId: "user_id_placeholder", // TODO: fine tune zod schema
        })),
      });

      console.log(
        form.formState.errors,
        form.formState.isValid,
        form.getValues(),
      );
    }

    if (isOpen && !accounts.length) {
      void fetchData();
    }
  }, [isOpen, provider, form, accounts, ref, institution_id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="p-4">
          <Tabs defaultValue="select-accounts" value={activeTab}>
            <TabsContent value="select-accounts">
              <>
                <DialogHeader className="mb-8">
                  <DialogTitle>Select Accounts</DialogTitle>
                  <DialogDescription>
                    Select the accounts to receive transactions. You can enable
                    or disable them later in settings if needed. Note: Initial
                    loading may take some time.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(connectBankAction.execute)}
                    className="scrollbar-hide relative h-[300px] space-y-6 overflow-auto pb-[80px]"
                  >
                    {loading && <RowsSkeleton />}

                    {accounts.map((account) => (
                      <FormField
                        key={account.id}
                        control={form.control}
                        name="accounts"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={account.id}
                              className="flex justify-between"
                            >
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
                                        account.account.name}
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
                                  checked={
                                    field.value.find(
                                      (value) => value.accountId === account.id,
                                    )?.enabled ?? false
                                  }
                                  onCheckedChange={(checked) => {
                                    console.log(field.value);
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

                    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background px-6 pb-6 pt-4">
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={
                          connectBankAction.status === "executing" ||
                          !form.formState.isValid ||
                          !form
                            .getValues("accounts")
                            .find((account) => account.enabled)
                        }
                      >
                        {connectBankAction.status === "executing" ? (
                          <Loader2 className="pointer-events-none h-4 w-4 animate-spin" />
                        ) : (
                          "Salva"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            </TabsContent>

            <TabsContent value="loading">
              <LoadingTransactions bankAccountIds={accounts.map((a) => a.id)} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
