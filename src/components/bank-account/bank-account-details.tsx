import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormatAmount } from "~/components/format-amount";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useBankAccountParams } from "~/hooks/use-bank-account-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { format } from "date-fns";
import { toast } from "sonner";

import { BankLogo } from "../bank-logo";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AccountTypeSelect } from "./forms/account-type-select";

export function BankAccountDetails() {
  const { params } = useBankAccountParams();
  const bankAccountId = params.bankAccountId!;

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.bankAccount.getById.queryOptions(
      { id: bankAccountId },
      {
        enabled: !!bankAccountId,
        staleTime: 0, // Always consider data stale so it always refetches
        // initialData: () => {
        //   const pages = queryClient
        //     .getQueriesData({ queryKey: trpc.transaction.get.infiniteQueryKey() })
        //     // @ts-expect-error investigate this
        //     .flatMap(([, data]) => data?.pages ?? [])
        //     .flatMap((page) => page.data ?? []);

        //   return pages.find((d) => d.id === transactionId);
        // },
      },
    ),
  );

  const updateBankAccountMutation = useMutation(
    trpc.bankAccount.update.mutationOptions({
      onSuccess: (_data) => {
        toast.success("Bank account updated");
        void queryClient.invalidateQueries({
          queryKey: trpc.asset.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankConnection.get.queryKey(),
        });
      },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.bankAccount.getById.queryKey({
              id: bankAccountId,
            }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.bankAccount.get.queryKey(),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.asset.get.queryKey(),
          }),
        ]);

        // Snapshot the previous values
        const previousData = {
          details: queryClient.getQueryData(
            trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          ),
          list: queryClient.getQueryData(trpc.asset.get.queryKey()),
        };

        // Optimistically update details view
        queryClient.setQueryData(
          trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          // @ts-expect-error update payload can have undefined fields
          (old) => {
            return {
              ...old,
              ...variables,
            };
          },
        );

        // Optimistically update list view
        queryClient.setQueryData(
          trpc.asset.get.queryKey(),
          // @ts-expect-error update payload can have undefined fields
          (old) => {
            if (!old || !variables) return old;

            return [
              ...old,
              {
                ...data,
                ...variables,
              },
            ];
          },
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Revert both caches on error
        queryClient.setQueryData(
          trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
          context?.previousData.details,
        );
        queryClient.setQueryData(
          trpc.asset.get.queryKey(),
          context?.previousData.list,
        );
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.getById.queryKey({ id: bankAccountId }),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.bankAccount.get.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.asset.get.queryKey(),
        });
      },
    }),
  );

  if (isLoading || !data) {
    return null;
  }

  const defaultValue = ["general"];

  if (data?.description) {
    defaultValue.push("description");
  }

  return (
    <div className="scrollbar-hide h-[calc(100vh-80px)] overflow-auto pb-12">
      <div className="mb-8 flex justify-between">
        <div className="flex flex-1 flex-col">
          {isLoading ? (
            <div className="mt-1 mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-[14px] w-[100px] rounded-full" />
              </div>
              <Skeleton className="h-[14px] w-[10%] rounded-full" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="mt-1 flex items-center space-x-2">
                {data.logoUrl && (
                  <BankLogo
                    src={data.logoUrl}
                    alt={data.institutionName ?? data.name}
                    size={24}
                  />
                )}
                <span className="line-clamp-1 text-sm">
                  {data.institutionName}
                </span>
              </div>
              <span className="text-xs text-[#606060] select-text">
                {data.updatedAt && format(new Date(data.updatedAt), "MMM d, y")}
              </span>
            </div>
          )}

          <h2 className="mt-6 mb-3 select-text">
            {isLoading ? (
              <Skeleton className="mb-2 h-[22px] w-[35%] rounded-md" />
            ) : (
              data?.name
            )}
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col space-y-1">
              {isLoading ? (
                <Skeleton className="mb-2 h-[30px] w-[50%] rounded-md" />
              ) : (
                <span className={cn("font-mono text-4xl select-text")}>
                  <FormatAmount
                    amount={data?.balance}
                    currency={data?.currency}
                  />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {data?.description && (
        <div className="border px-4 py-3 text-sm text-popover-foreground select-text dark:bg-[#1A1A1A]/95">
          {data.description}
        </div>
      )}

      <Accordion type="multiple" defaultValue={defaultValue}>
        <AccordionItem value="general">
          <AccordionTrigger>General</AccordionTrigger>
          <AccordionContent className="select-text">
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">Name</Label>
              <p className="mb-2 text-xs text-muted-foreground">
                This is the name of your bank account. You can use a custom name
                to help you identify it easily.
              </p>
              <Input
                className="bg-background"
                defaultValue={data.name}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                onBlur={(event) => {
                  updateBankAccountMutation.mutate({
                    id: bankAccountId,
                    name: event.target.value,
                  });
                }}
              />
            </div>
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">
                Account Type
              </Label>
              <p className="mb-2 text-xs text-muted-foreground">
                The type of account determines its classification, such as asset
                or liability. This affects how the account is displayed and
                managed.
              </p>
              <AccountTypeSelect
                value={data.subtype ?? undefined}
                onValueChange={(type, subtype) => {
                  updateBankAccountMutation.mutate({
                    id: bankAccountId,
                    subtype: subtype,
                    type: type,
                  });
                }}
              />
            </div>
            <div className="mb-4 border-b pb-4">
              <Label className="text-md mb-2 block font-medium">Currency</Label>
              <div className="flex flex-row items-center justify-between">
                <div className="flex-1 space-y-0.5 pr-4">
                  <p className="text-xs text-muted-foreground">
                    Currency of the account. Only accounts that are{" "}
                    <b>not connected</b> to a bank can change currency.
                  </p>
                </div>
                <Select
                  disabled={!!data.connectionId}
                  value={data.currency}
                  onValueChange={async (value) => {
                    updateBankAccountMutation.mutate({
                      id: bankAccountId,
                      currency: value,
                    });
                  }}
                >
                  <SelectTrigger className="min-w-[80px] flex-0 bg-background">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectGroup>
                      {[
                        { id: "EUR", name: "EUR" },
                        { id: "USD", name: "USD" },
                      ].map(({ id, name }) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="">
              <Label className="text-md mb-2 block font-medium">
                Enable bank account
              </Label>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs text-muted-foreground">
                    Enable or disable this bank account. When enabled, the
                    account will be included in your dashboard and available for
                    transaction updates if connected. Disabling the account will
                    exclude it from the dashboard and prevent it from being
                    updated with new transactions.
                  </p>
                </div>

                <Switch
                  checked={data.enabled}
                  onCheckedChange={(checked) => {
                    updateBankAccountMutation.mutate({
                      id: bankAccountId,
                      enabled: checked,
                    });
                  }}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="description">
          <AccordionTrigger>Description</AccordionTrigger>
          <AccordionContent className="select-text">
            <Textarea
              placeholder="Informazioni aggiuntive"
              className="min-h-[100px] resize-none bg-background"
              defaultValue={data.description ?? ""}
              onBlur={(event) => {
                updateBankAccountMutation.mutate({
                  id: bankAccountId,
                  description: event.target.value,
                });
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
