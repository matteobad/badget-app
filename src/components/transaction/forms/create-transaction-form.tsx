"use client";

import { useEffect, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CategorySelect } from "~/components/category/forms/category-select";
import { CurrencyInput } from "~/components/custom/currency-input";
import { AccountPicker } from "~/components/forms/account-picker";
import { SubmitButton } from "~/components/submit-button";
import { TagsSelect } from "~/components/tag/tags-select";
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
import { type DB_AttachmentType } from "~/server/db/schema/transactions";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { createTransactionSchema } from "~/shared/validators/transaction.schema";
import { formatSize } from "~/utils/format";
import { UploadDropzone } from "~/utils/uploadthing";
import { format } from "date-fns";
import { type Tag } from "emblor";
import { CalendarIcon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod/v4";

import { deleteTransactionAttachmentAction } from "../../../features/transaction/server/actions";

export default function CreateTransactionForm() {
  const [attachments, setAttachments] = useState<DB_AttachmentType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { setParams } = useTransactionParams();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: accounts } = useQuery(trpc.bankAccount.get.queryOptions({}));

  const categorizeTransactionMutation = useMutation(
    trpc.transaction.categorize.mutationOptions({
      onError: console.error,
      onSuccess: (data) => {
        if (form.getFieldState("categoryId").isDirty) return;
        form.setValue("categoryId", data);
      },
    }),
  );

  const createTransactionMutation = useMutation(
    trpc.transaction.create.mutationOptions({
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

  const deleteAttachment = useAction(deleteTransactionAttachmentAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data, input }) => {
      console.log(data?.message);
      setAttachments((prev) => prev.filter((_) => _.id !== input.id));
    },
  });

  const form = useForm<z.infer<typeof createTransactionSchema>>({
    resolver: standardSchemaResolver(createTransactionSchema),
    defaultValues: {
      date: new Date(),
      description: undefined,
      currency: "EUR",
      accountId: accounts?.at(0)?.id,
      attachment_ids: [],
      tags: tags,
      manual: true,
    },
  });

  const bankAccountId = form.watch("accountId");

  const handleSubmit = (data: z.infer<typeof createTransactionSchema>) => {
    const formattedData = {
      ...data,
    };

    createTransactionMutation.mutate(formattedData);
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <FormField
          control={form.control}
          name="description"
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
                    categorizeTransactionMutation.mutate({
                      description: event.target.value,
                    });
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

                      if (form.getFieldState("categoryId").isDirty) return;

                      if (
                        values.floatValue !== undefined &&
                        values.floatValue < 0
                      ) {
                        form.setValue("categoryId", null);
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
                  <SelectTrigger>
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
                <AccountPicker
                  options={accounts ?? []}
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
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
                      selected={field.value}
                      onSelect={field.onChange}
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
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Categoria</FormLabel>
                <CategorySelect
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  onReset={() => {
                    form.resetField("categoryId", { defaultValue: undefined });
                  }}
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
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden">
                <UploadDropzone
                  content={{
                    uploadIcon: <></>,
                  }}
                  className="mt-0 h-[200px]"
                  endpoint="attachmentUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    const serverData = res[0]?.serverData.attachments ?? "[]";
                    const uploaded = JSON.parse(
                      serverData,
                    ) as DB_AttachmentType[];
                    const attachmentIds = uploaded.map((_) => _.id);
                    setAttachments(uploaded);
                    form.setValue("attachment_ids", attachmentIds);
                    toast.info("Attachment caricati");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    console.error(error.message);
                    toast.error(error.message);
                  }}
                />
              </div>
              <ul className="mt-4 space-y-4">
                {attachments.map((file) => (
                  <div
                    className="flex items-center justify-between"
                    key={file.fileKey}
                  >
                    <div className="flex w-80 flex-col space-y-0.5">
                      <span className="truncate">{file.fileName}</span>
                      <span className="text-xs text-muted-foreground">
                        {file.fileSize && formatSize(file.fileSize)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="flex w-auto hover:bg-transparent"
                      disabled={deleteAttachment.isExecuting}
                      onClick={() =>
                        deleteAttachment.execute({
                          id: file.id,
                          fileKey: file.fileKey,
                        })
                      }
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </ul>
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
                name="exclude"
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
