"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod/v4";
import { useConnectParams } from "~/hooks/use-connect-params";
import { getInitials } from "~/lib/utils";
import { sendSupportAction } from "~/server/domain/bank-connection/actions";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createBankConnectionSchema } from "~/shared/validators/bank-connection.schema";

import { FormatAmount } from "../format-amount";
import { SubmitButton } from "../submit-button";
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
import { Textarea } from "../ui/textarea";
import { LoadingTransactionsEvent } from "./loading-transactions-event";

function RowsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index.toString()} className="flex items-center space-x-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-[250px] rounded-none" />
            <Skeleton className="h-2.5 w-[200px] rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SupportForm() {
  const form = useForm({
    resolver: zodResolver(z.object({ message: z.string() })),
    defaultValues: {
      message: "",
    },
  });

  const sendSupport = useAction(sendSupportAction, {
    onSuccess: () => {
      form.reset();
    },
  });

  const handleOnSubmit = form.handleSubmit((values) => {
    sendSupport.execute({
      message: values.message,
      type: "bank-connection",
      priority: "3",
      subject: "Select bank accounts",
      url: document.URL,
    });
  });

  if (sendSupport.status === "hasSucceeded") {
    return (
      <div className="flex h-[250px] flex-col items-center justify-center space-y-1">
        <p className="text-sm font-medium">Thank you!</p>
        <p className="text-sm text-[#4C4C4C]">
          We will be back with you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleOnSubmit}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue you're facing, along with any relevant information. Please be as detailed and specific as possible."
                  className="min-h-[150px] resize-none"
                  autoFocus
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              sendSupport.status === "executing" || !form.formState.isValid
            }
            className="mt-4"
          >
            {sendSupport.status === "executing" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function SelectBankAccountsModal() {
  const trpc = useTRPC();

  const [runId, setRunId] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();
  const [activeTab, setActiveTab] = useState<
    "select-accounts" | "loading" | "support"
  >("select-accounts");

  const { step, error, setParams, provider, ref } = useConnectParams();

  const isOpen = step === "account";

  const { data, isLoading } = useQuery(
    trpc.bankConnection.getAccounts.queryOptions(
      {
        id: ref!,
        provider: provider!,
      },
      {
        enabled: isOpen && ref !== null,
      },
    ),
  );

  const connectBankConnectionMutation = useMutation(
    trpc.bankConnection.create.mutationOptions({
      onError: () => {
        toast.error("Something went wrong please try again.");
      },
      onSuccess: (data) => {
        if (data?.id) {
          setRunId(data.id);
          setAccessToken(data.publicAccessToken);
          setActiveTab("loading");
        }
      },
    }),
  );

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
    void setParams(null);
  };

  const form = useForm<z.infer<typeof createBankConnectionSchema>>({
    resolver: standardSchemaResolver(createBankConnectionSchema),
    defaultValues: {
      referenceId: ref!,
      provider: provider!,
      accounts: [],
    },
  });

  useEffect(() => {
    form.reset({
      referenceId: ref!,
      provider: provider!,
      accounts: data?.map((account) => ({
        accountId: account.externalId!,
        // institutionId: account.  .!,
        logoUrl: account.logoUrl,
        name: account.name,
        bankName: account.name,
        balance: account.balance,
        currency: account.currency,
        enabled: true,
        type: account.type,
        subtype: account.subtype ?? undefined,
        accountReference: ref!,
        authoritativeFrom: account.authoritativeFrom,
        // expiresAt: account.expires_at,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ref]);

  function onSubmit(values: z.infer<typeof createBankConnectionSchema>) {
    connectBankConnectionMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="p-4">
          <Tabs defaultValue="select-accounts" value={activeTab}>
            <TabsContent value="select-accounts">
              <DialogHeader className="mb-8">
                <DialogTitle>Select Accounts</DialogTitle>
                <DialogDescription>
                  Select the accounts to receive transactions. You can enable or
                  disable them later in settings if needed. Note: Initial
                  loading may take some time.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="scrollbar-hide relative h-[300px] space-y-6 overflow-auto pb-[100px]"
                >
                  {isLoading && <RowsSkeleton />}

                  {data?.map((account) => (
                    <FormField
                      key={account.externalId}
                      control={form.control}
                      name="accounts"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={account.externalId}
                            className="flex items-center justify-between"
                          >
                            <FormLabel className="mr-8 flex w-full items-center space-x-4">
                              <Avatar className="size-[34px]">
                                <AvatarImage
                                  src={account.logoUrl ?? ""}
                                  alt={`${account.name} logo`}
                                />
                                <AvatarFallback className="text-xs">
                                  {getInitials(account.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex w-full items-center justify-between">
                                <div className="flex flex-col">
                                  <p className="mb-1 text-sm leading-none font-medium">
                                    {account.name}
                                  </p>
                                  <span className="text-xs font-normal text-[#878787]">
                                    {/* {t(`account_type.${account.type}`)} */}
                                    {account.type}
                                  </span>
                                </div>

                                <span className="text-sm text-[#878787]">
                                  <FormatAmount
                                    amount={account.balance}
                                    currency={account.currency}
                                  />
                                </span>
                              </div>
                            </FormLabel>

                            <div className="flex h-[34px] items-center">
                              <FormControl>
                                <Switch
                                  checked={
                                    field.value?.find(
                                      (value) =>
                                        value.accountId === account.externalId,
                                    )?.enabled
                                  }
                                  onCheckedChange={(checked) => {
                                    return field.onChange(
                                      field.value.map((value) => {
                                        if (
                                          value.accountId === account.externalId
                                        ) {
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
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}

                  <div className="fixed right-0 bottom-0 left-0 z-10 rounded-b-lg bg-background px-6 pt-4 pb-6">
                    <SubmitButton
                      className="w-full"
                      type="submit"
                      isSubmitting={connectBankConnectionMutation.isPending}
                      disabled={
                        connectBankConnectionMutation.isPending ||
                        !form.formState.isValid
                      }
                    >
                      Save
                    </SubmitButton>

                    <div className="mt-4 flex justify-center">
                      <button
                        type="button"
                        className="text-xs text-[#878787]"
                        onClick={() => setActiveTab("support")}
                      >
                        Need support
                      </button>
                    </div>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="loading">
              <LoadingTransactionsEvent
                accessToken={accessToken}
                runId={runId}
                setRunId={setRunId}
                onClose={onClose}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="support">
              <div className="mb-6 flex items-center space-x-3">
                <button
                  type="button"
                  className="items-center border bg-accent p-1"
                  onClick={() => setActiveTab("select-accounts")}
                >
                  <ArrowLeftIcon />
                </button>
                <h2>Support</h2>
              </div>
              <SupportForm />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
