"use client";

import { useEffect, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SelectAccount } from "~/components/bank-account/forms/select-account";
import { CurrencyInput } from "~/components/custom/currency-input";
import { SubmitButton } from "~/components/submit-button";
import { TagsSelect } from "~/components/tag/tags-select";
import { TransactionAttachments } from "~/components/transaction-attachment/transaction-attachment";
import { SelectCategory } from "~/components/transaction-category/select-category";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { Textarea } from "~/components/ui/textarea";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createManualTransactionSchema } from "~/shared/validators/transaction.schema";
import { format } from "date-fns";
import { type Tag } from "emblor";
import { CalendarIcon } from "lucide-react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

export default function CreateTransactionForm() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { setParams } = useTransactionParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
        form.reset();
        void setParams({ createTransaction: null });
      },
    }),
  );

  const form = useForm<z.infer<typeof createManualTransactionSchema>>({
    resolver: standardSchemaResolver(createManualTransactionSchema),
    defaultValues: {
      categorySlug: undefined,
      date: format(new Date(), "yyyy-MM-dd"),
      description: "",
      currency: "EUR",
      accountId: accounts?.at(0)?.id,
      attachments: undefined,
      tags: tags,
      method: "unknown",
      status: "posted",
    },
  });

  const attachments = form.watch("attachments");
  const bankAccountId = form.watch("accountId");

  const handleSubmit = (
    data: z.infer<typeof createManualTransactionSchema>,
  ) => {
    createTransactionMutation.mutate(data);
  };

  const onError = (errors: typeof form.formState.errors) => {
    // raccogli tutti i messaggi di errore
    const messages = Object.values(errors).map((err) => err?.message);

    messages.forEach((msg) => {
      if (msg) toast.error(msg);
    });
  };

  useEffect(() => {
    if (!bankAccountId && accounts?.length) {
      const firstAccountId = accounts.at(0)?.id;
      if (firstAccountId) {
        form.setValue("accountId", firstAccountId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, bankAccountId]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, onError)}
        className="space-y-4 p-[3px]"
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  className="bg-background"
                  onBlur={(event) => {
                    if (event.target.value.length < 3) return;
                    // categorizeTransactionMutation.mutate({
                    //   name: event.target.value,
                    // });
                  }}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4 flex space-x-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Importo</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue);

                      if (form.getFieldState("categorySlug").isDirty) return;

                      if (
                        values.floatValue !== undefined &&
                        values.floatValue < 0
                      ) {
                        form.setValue("categorySlug", undefined);
                      }
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
              <FormItem className="w-full">
                <FormLabel>Valuta</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full bg-background">
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

        <div className="mt-4 flex space-x-4">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Conto</FormLabel>
                <SelectAccount
                  align="start"
                  className="w-full"
                  selected={field.value}
                  onChange={(account) => {
                    field.onChange(account.id);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
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
                    </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4 flex space-x-4">
          <FormField
            control={form.control}
            name="categorySlug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Categoria</FormLabel>
                <SelectCategory
                  hideLoading
                  selected={field.value}
                  onChange={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tags</FormLabel>
                <TagsSelect
                  {...field}
                  placeholder="Enter a tag"
                  tags={tags}
                  className="sm:min-w-[450px]"
                  setTags={(newTags) => {
                    setTags(newTags);
                    form.setValue("tags", newTags as Tag[]);
                  }}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="attchament">
            <AccordionTrigger>Allegati</AccordionTrigger>
            <AccordionContent className="space-y-2">
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

          {/* <AccordionItem value="general">
            <AccordionTrigger>General</AccordionTrigger>
            <AccordionContent className="select-text"> */}
          <div className="mt-6 mb-4">
            <Label
              htmlFor="settings"
              className="mb-2 block text-sm font-medium"
            >
              Exclude from analytics
            </Label>
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <p className="text-xs text-muted-foreground">
                  Exclude this transaction from analytics like profit, expense
                  and revenue. This is useful for internal transfers between
                  accounts to avoid double-counting.
                </p>
              </div>

              <FormField
                control={form.control}
                name="internal"
                render={({ field }) => (
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                )}
              />
            </div>
          </div>
          {/* </AccordionContent>
          </AccordionItem> */}

          <AccordionItem value="note">
            <AccordionTrigger>Note</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Textarea
                        placeholder="Informazioni aggiuntive"
                        className="min-h-[100px] resize-none bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
    </Form>
  );
}
