"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { SelectAccount } from "~/components/bank-account/forms/select-account";
import { CurrencyInput } from "~/components/custom/currency-input";
import { SubmitButton } from "~/components/submit-button";
import { TransactionAttachments } from "~/components/transaction-attachment/transaction-attachment";
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
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { useSpaceQuery } from "~/hooks/use-space";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { uniqueCurrencies } from "~/shared/constants/currencies";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createManualTransactionSchema } from "~/shared/validators/transaction.schema";

export default function CreateTransactionForm() {
  const { setParams } = useTransactionParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: space } = useSpaceQuery();

  const { data: accounts } = useQuery(
    trpc.bankAccount.get.queryOptions({
      manual: true,
    }),
  );

  // TODO: rewrite this logic with gemini
  // const categorizeTransactionMutation = useMutation(
  //   trpc.transaction.categorize.mutationOptions({
  //     onError: console.error,
  //     onSuccess: (data) => {
  //       if (form.getFieldState("categoryId").isDirty) return;
  //       form.setValue("categoryId", data ?? undefined);
  //     },
  //   }),
  // );

  const createTransactionMutation = useMutation(
    trpc.transaction.createManualTransaction.mutationOptions({
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: (_data) => {
        toast.success("Transazione creata");

        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.get.infiniteQueryKey(),
        });

        void queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAmountRange.queryKey(),
        });

        // Invalidate global search
        void queryClient.invalidateQueries({
          queryKey: trpc.search.global.queryKey(),
        });

        form.reset();
        void setParams({ createTransaction: null });
      },
    }),
  );

  const form = useForm<z.infer<typeof createManualTransactionSchema>>({
    resolver: zodResolver(createManualTransactionSchema),
    defaultValues: {
      categorySlug: "uncategorized",
      date: formatISO(new Date(), { representation: "date" }),
      description: "",
      currency: space?.baseCurrency ?? "EUR",
      accountId: accounts?.at(0)?.id,
      attachments: undefined,
      transactionType: "expense" as const,
    },
  });

  const attachments = form.watch("attachments");
  const bankAccountId = form.watch("accountId");
  const currency = form.watch("currency");

  const onSubmit = (data: z.infer<typeof createManualTransactionSchema>) => {
    // Amount is already stored with correct sign (negative for expense, positive for income)
    createTransactionMutation.mutate({
      ...data,
    });
  };

  useEffect(() => {
    if (!bankAccountId && accounts?.length) {
      const firstAccountId = accounts.at(0)?.id;
      if (firstAccountId) {
        form.setValue("accountId", firstAccountId);
      }
    }
  }, [accounts, bankAccountId]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="p-1">
        <Controller
          name="transactionType"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Transaction Type</FieldLabel>
              <div className="flex w-full border border-border bg-muted">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-6 px-2 flex-1 rounded-none text-xs border-r border-border last:border-r-0",
                    field.value === "expense"
                      ? "bg-transparent"
                      : "bg-background font-medium",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    field.onChange("expense");
                    // Clear income category if switching to expense
                    if (form.getValues("categorySlug") === "income") {
                      form.setValue("categorySlug", undefined);
                    }
                    // Update amount to negative if there's an amount
                    const currentAmount = form.getValues("amount");
                    if (currentAmount && currentAmount > 0) {
                      form.setValue("amount", -Math.abs(currentAmount));
                    }
                  }}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-6 px-2 flex-1 rounded-none text-xs border-r border-border last:border-r-0",
                    field.value === "income"
                      ? "bg-transparent"
                      : "bg-background font-medium",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    field.onChange("income");
                    // Update amount to positive if there's an amount
                    const currentAmount = form.getValues("amount");
                    if (currentAmount) {
                      const positiveAmount = Math.abs(currentAmount);
                      form.setValue("amount", positiveAmount);
                      // Auto-select income category if amount is positive
                      if (positiveAmount > 0) {
                        form.setValue("categorySlug", "income");
                      }
                    }
                  }}
                >
                  Income
                </Button>
              </div>
              <FieldDescription>
                Select whether this is money coming in (income) or going out
                (expense)
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="bg-background"
                placeholder="e.g., Office supplies, Invoice payment"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                onBlur={(event) => {
                  if (event.target.value.length < 3) return;
                  // categorizeTransactionMutation.mutate({
                  //   name: event.target.value,
                  // });
                }}
              />
              <FieldDescription>
                A brief description of what this transaction is for
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Importo</FieldLabel>
                <ButtonGroup>
                  <Select
                    value={currency}
                    onValueChange={(value) => form.setValue("currency", value)}
                  >
                    <SelectTrigger className="font-mono bg-background">
                      {currency}
                    </SelectTrigger>
                    <SelectContent className="min-w-24">
                      {uniqueCurrencies.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}{" "}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue);

                      if (form.getFieldState("categorySlug").isDirty) return;

                      if (
                        values.floatValue !== undefined &&
                        values.floatValue < 0
                      ) {
                        form.setValue("categorySlug", "uncategorized");
                      }
                    }}
                  />
                </ButtonGroup>
                <FieldDescription>
                  Enter the transaction amount
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Data</FieldLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal ring-inset",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd MMMM yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={(value) => {
                        field.onChange(format(value, "yyyy-MM-dd"));
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      captionLayout="dropdown"
                      required // allow selecting same date
                    />
                  </PopoverContent>
                </Popover>
                <FieldDescription>
                  When this transaction occurred
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="accountId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Account</FieldLabel>
                <SelectAccount
                  align="start"
                  className="w-full"
                  selected={field.value}
                  onChange={(value) => {
                    field.onChange(value.id);
                  }}
                />
                <FieldDescription>
                  The account this transaction belongs to
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="categorySlug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <SelectCategory
                  hideLoading
                  align="start"
                  selected={field.value}
                  onChange={(selected) => field.onChange(selected.slug)}
                />
                <FieldDescription>
                  Help organize and track your transactions
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <Accordion
        type="multiple"
        defaultValue={["attachments"]}
        className="mt-2"
      >
        <AccordionItem value="attachments">
          <AccordionTrigger className="px-1">Allegati</AccordionTrigger>
          <AccordionContent className="space-y-2 p-1">
            <TransactionAttachments
              // NOTE: For manual attachments, we need to generate a unique id
              id={nanoid()}
              data={attachments?.map((attachment) => ({
                ...attachment,
                id: nanoid(),
                filename: attachment.name,
                path: attachment.path.join("/"),
              }))}
              onUpload={(files) => {
                // @ts-expect-error possible undefined
                form.setValue("attachments", files);
              }}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="internal">
          <AccordionTrigger className="px-1">
            Exclude from analytics
          </AccordionTrigger>
          <AccordionContent className="px-1">
            <Controller
              name="internal"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor={field.name} className="sr-only">
                      Exclude from analytics
                    </FieldLabel>
                    <FieldDescription>
                      Exclude this transaction from analytics like profit,
                      expense and revenue. This is useful for internal transfers
                      between accounts to avoid double-counting.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id={field.name}
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                </Field>
              )}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="note">
          <AccordionTrigger className="px-1">Note</AccordionTrigger>
          <AccordionContent className="p-1">
            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="sr-only">
                    Note
                  </FieldLabel>
                  <Input
                    {...field}
                    placeholder="Note"
                    className="min-h-[100px] resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Add any additional details or context about this transaction
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="fixed right-8 bottom-8 w-full sm:max-w-[455px]">
        <SubmitButton
          isSubmitting={createTransactionMutation.isPending}
          className="w-full"
        >
          Create
        </SubmitButton>
      </div>
    </form>
  );
}
