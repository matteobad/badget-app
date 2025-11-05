"use client";

import { utc } from "@date-fns/utc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { SelectAccount } from "~/components/bank-account/forms/select-account";
import { CurrencyInput } from "~/components/custom/currency-input";
import { SelectCurrency } from "~/components/select-currency";
import { TransactionAttachments } from "~/components/transaction-attachment/transaction-attachment";
import { CategoryLabel } from "~/components/transaction-category/category-badge";
import { SelectCategory } from "~/components/transaction-category/select-category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { Calendar } from "~/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { useUpdateTransactionCategory } from "~/hooks/use-update-transaction-category";
import { useUserQuery } from "~/hooks/use-user";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { uniqueCurrencies } from "~/shared/constants/currencies";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { useScopedI18n } from "~/shared/locales/client";

type Transaction = RouterOutput["transaction"]["getById"];

type Props = {
  transaction: NonNullable<Transaction>;
};

export function TransactionEditForm({ transaction }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  // Local state only for debounced inputs
  const [name, setName] = useState(transaction.name);
  // Store amount with correct sign (negative for expense, positive for income)
  const [amount, setAmount] = useState(Math.abs(transaction.amount));
  const [note, setNote] = useState(transaction.note ?? "");

  // Debounce text inputs
  const [debouncedName] = useDebounceValue(name, 500);
  const [debouncedAmount] = useDebounceValue(amount, 500);
  const [debouncedNote] = useDebounceValue(note, 500);

  const t = useScopedI18n("transactions");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: user } = useUserQuery();

  const { data: accounts } = useQuery(
    trpc.bankAccount.get.queryOptions({
      enabled: true,
    }),
  );

  const { data: categories } = useQuery(
    trpc.transactionCategory.get.queryOptions(),
  );

  const { updateCategory } = useUpdateTransactionCategory();

  const updateTransactionMutation = useMutation(
    trpc.transaction.updateTransaction.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });

        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getById.queryKey({ id: transaction.id }),
        });

        // Invalidate global search
        queryClient.invalidateQueries({
          queryKey: trpc.search.global.queryKey(),
        });
      },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await Promise.all([
          queryClient.cancelQueries({
            queryKey: trpc.transaction.getById.queryKey({
              id: transaction.id,
            }),
          }),
          queryClient.cancelQueries({
            queryKey: trpc.transaction.get.infiniteQueryKey(),
          }),
        ]);

        // Snapshot the previous values
        const previousData = {
          details: queryClient.getQueryData(
            trpc.transaction.getById.queryKey({ id: transaction.id }),
          ),
          list: queryClient.getQueryData(
            trpc.transaction.get.infiniteQueryKey(),
          ),
        };

        // Optimistically update details view
        queryClient.setQueryData(
          trpc.transaction.getById.queryKey({ id: transaction.id }),
          (old: any) => {
            if (variables.categorySlug && categories) {
              const category = categories.find(
                (c) => c.slug === variables.categorySlug,
              );

              if (category) {
                return {
                  ...old,
                  ...variables,
                  category,
                };
              }
            }

            return {
              ...old,
              ...variables,
            };
          },
        );

        // Optimistically update list view
        queryClient.setQueryData(
          trpc.transaction.get.infiniteQueryKey(),
          (old: any) => {
            if (!old?.pages) return old;

            return {
              ...old,
              pages: old.pages.map((page: any) => ({
                ...page,
                data: page.data.map((t: any) =>
                  t.id === transaction.id
                    ? {
                        ...t,
                        ...variables,
                      }
                    : t,
                ),
              })),
            };
          },
        );

        return { previousData };
      },
      onError: (_, __, context) => {
        // Revert on error
        if (context?.previousData) {
          queryClient.setQueryData(
            trpc.transaction.getById.queryKey({ id: transaction.id }),
            context.previousData.details,
          );
          queryClient.setQueryData(
            trpc.transaction.get.infiniteQueryKey(),
            context.previousData.list,
          );
        }
      },
    }),
  );

  // Derive transaction type from amount sign
  // Ensure amount is treated as a number for comparison
  // Default to expense if amount is 0 or undefined
  // Positive amounts = income, negative amounts = expense
  const transactionAmount =
    typeof transaction.amount === "number"
      ? transaction.amount
      : Number(transaction.amount) || 0;

  // Determine type: use amount sign as primary indicator
  // Negative amounts = expense, positive amounts = income
  let transactionType: "income" | "expense";
  if (transactionAmount > 0) transactionType = "income";
  else transactionType = "expense";

  // Sync local state with transaction prop when it changes
  useEffect(() => {
    setName(transaction.name);
    setAmount(Math.abs(transaction.amount));
    setNote(transaction.note ?? "");
  }, [transaction.id, transaction.name, transaction.amount, transaction.note]);

  // Update on debounced name change
  useEffect(() => {
    if (debouncedName !== transaction.name && debouncedName.trim()) {
      updateTransactionMutation.mutate({
        id: transaction.id,
        name: debouncedName,
      });
    }
  }, [debouncedName]);

  // Update on debounced amount change
  useEffect(() => {
    // Amount is stored with correct sign (negative for expense, positive for income)
    const finalAmount =
      transactionType === "expense"
        ? -Math.abs(debouncedAmount)
        : Math.abs(debouncedAmount);

    // Ensure we're comparing numbers
    const currentAmount = Number(transaction.amount);
    if (finalAmount !== currentAmount) {
      updateTransactionMutation.mutate({
        id: transaction.id,
        amount: finalAmount,
      });
    }
  }, [debouncedAmount, transactionType, transaction.amount, transaction.id]);

  // Update on debounced note change
  useEffect(() => {
    const noteValue = debouncedNote?.trim() || null;
    if (noteValue !== (transaction.note ?? null)) {
      updateTransactionMutation.mutate({
        id: transaction.id,
        note: noteValue ?? undefined,
      });
    }
  }, [debouncedNote]);

  // Memoize selected category from transaction
  const selectedCategory = useMemo(() => {
    if (transaction.category) {
      return {
        id: transaction.category.id,
        slug: transaction.category.slug,
        name: transaction.category.name,
        color: transaction.category.color ?? "",
        icon: transaction.category.icon ?? "",
      };
    }

    return undefined;
  }, [transaction.category]);

  return (
    <div className="space-y-8 p-1">
      <div>
        <Label htmlFor="transactionType" className="mb-2 block">
          {t("transaction_type_lbl")}
        </Label>
        <div className="flex w-full border border-border bg-muted shadow-xs">
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-8 px-2 flex-1 rounded-none text-xs border-r border-border last:border-r-0",
              transactionType === "expense"
                ? "bg-transparent"
                : "bg-background font-medium",
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Clear income category if switching to expense
              if (transaction.category?.slug === "income") {
                updateTransactionMutation.mutate({
                  id: transaction.id,
                  categorySlug: "uncategorized",
                });
              }
              // Update amount immediately (convert to negative)
              const finalAmount = -Math.abs(amount);
              updateTransactionMutation.mutate({
                id: transaction.id,
                amount: finalAmount,
              });
            }}
          >
            {t("transaction_type_val.expense")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-8 px-2 flex-1 rounded-none text-xs border-r border-border last:border-r-0",
              transactionType === "income"
                ? "bg-transparent"
                : "bg-background font-medium",
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Update amount immediately
              const finalAmount = Math.abs(amount);
              updateTransactionMutation.mutate({
                id: transaction.id,
                amount: finalAmount,
              });
            }}
          >
            {t("transaction_type_val.income")}
          </Button>
        </div>
        <p className="text-[0.8rem] text-muted-foreground mt-2">
          {t("transaction_type_msg")}
        </p>
      </div>

      <div>
        <Label htmlFor="name" className="mb-2 block">
          {t("description_lbl")}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Office supplies, Invoice payment"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="bg-background"
        />
        <p className="text-[0.8rem] text-muted-foreground mt-2">
          {t("description_msg")}
        </p>
      </div>

      <div className="flex space-x-4">
        <div className="w-full">
          <Label htmlFor="amount" className="mb-2 block">
            {t("amount_lbl")}
          </Label>
          <ButtonGroup className="[&_button]:max-w-24">
            <SelectCurrency
              currencies={uniqueCurrencies}
              onChange={(value) => {
                updateTransactionMutation.mutate({
                  id: transaction.id,
                  currency: value,
                });
              }}
              value={transaction.currency}
            />
            <CurrencyInput
              value={amount}
              placeholder="0.00"
              allowNegative={false}
              onValueChange={(values) => {
                if (values.floatValue !== undefined) {
                  const positiveValue = Math.abs(values.floatValue);
                  setAmount(positiveValue);

                  // Update amount with correct sign based on transaction type
                  const finalAmount =
                    transactionType === "expense"
                      ? -positiveValue
                      : positiveValue;

                  // Ensure we're comparing numbers
                  const currentAmount = Number(transaction.amount);
                  if (finalAmount !== currentAmount) {
                    updateTransactionMutation.mutate({
                      id: transaction.id,
                      amount: finalAmount,
                    });
                  }
                }
              }}
            />
          </ButtonGroup>
          <p className="text-[0.8rem] text-muted-foreground mt-2">
            {t("amount_msg")}
          </p>
        </div>

        <div className="w-full">
          <Label htmlFor="date" className="mb-2 block">
            {t("date_lbl")}
          </Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full pl-3 justify-start font-normal"
                onClick={() => setIsOpen(true)}
              >
                {transaction.date ? (
                  format(
                    utc(transaction.date),
                    user?.dateFormat ?? "dd MMMM yyyy",
                  )
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={transaction.date ? utc(transaction.date) : undefined}
                onSelect={(value) => {
                  if (value) {
                    // Use formatISO with date representation to format as YYYY-MM-DD
                    // This handles timezone correctly by using the date components
                    const dateValue = formatISO(value, {
                      representation: "date",
                    });
                    setIsOpen(false);
                    updateTransactionMutation.mutate({
                      id: transaction.id,
                      date: dateValue,
                    });
                  }
                }}
                disabled={(date) => date < new Date("1900-01-01")}
                captionLayout="dropdown"
                required // allow selecting same date
              />
            </PopoverContent>
          </Popover>
          <p className="text-[0.8rem] text-muted-foreground mt-2">
            {t("date_msg")}
          </p>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="w-full">
          <Label htmlFor="account" className="mb-2 block">
            {t("account_lbl")}
          </Label>
          <SelectAccount
            onChange={(value) => {
              updateTransactionMutation.mutate({
                id: transaction.id,
                bankAccountId: value.id,
              });
            }}
            selected={transaction.account?.id ?? accounts?.at(0)?.id ?? ""}
          />
          <p className="text-[0.8rem] text-muted-foreground mt-2">
            {t("account_msg")}
          </p>
        </div>

        <div className="w-full">
          <Label htmlFor="category" className="mb-2 block">
            {t("category_lbl")}
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !transaction.category && "text-muted-foreground",
                )}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {transaction.category ? (
                  <CategoryLabel
                    category={{
                      name: selectedCategory?.name ?? "uncategorized",
                      color: selectedCategory?.color ?? null,
                      icon: selectedCategory?.icon ?? null,
                    }}
                  />
                ) : (
                  <span>Select a category</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="max-h-[210px] w-(--radix-dropdown-menu-trigger-width) overflow-y-auto p-0"
              sideOffset={8}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <SelectCategory
                headless
                onChange={async (value) => {
                  if (value && transaction.name) {
                    await updateCategory(transaction.id, transaction.name, {
                      id: value.id,
                      name: value.name,
                      slug: value.slug,
                    });
                  } else if (!value && transaction.name) {
                    await updateCategory(transaction.id, transaction.name, {
                      id: "",
                      name: "",
                      slug: "",
                    });
                  }
                }}
                hideLoading
                selected={selectedCategory?.slug}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-[0.8rem] text-muted-foreground mt-2">
            {t("category_msg")}
          </p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["attachments"]}>
        <AccordionItem value="attachments">
          <AccordionTrigger>Allegati</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Upload receipts, invoices, or other documents related to this
                transaction
              </p>
              <TransactionAttachments
                id={transaction.id}
                data={transaction.attachments}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="internal">
          <AccordionTrigger>{t("exclude_lbl")}</AccordionTrigger>
          <AccordionContent className="px-1">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs text-muted-foreground">
                  {t("exclude_msg")}
                </p>
              </div>

              <Switch
                checked={transaction.internal ?? false}
                onCheckedChange={(checked) => {
                  updateTransactionMutation.mutate({
                    id: transaction.id,
                    internal: checked,
                  });
                }}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="note">
          <AccordionTrigger>Note</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Add any additional details or context about this transaction
              </p>
              <Textarea
                placeholder="Note"
                className="min-h-[100px] resize-none bg-background"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
