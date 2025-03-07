import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { AccountAvatar } from "~/components/account-avatar";
import { CategoryPicker } from "~/components/forms/category-picker";
import TagsPicker from "~/components/forms/tags-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { type DB_AttachmentType } from "~/server/db/schema/transactions";
import { formatAmount, formatSize } from "~/utils/format";
import { UploadDropzone } from "~/utils/uploadthing";
import {
  deleteTransactionAttachmentAction,
  updateTransactionAction,
} from "../server/actions";
import { type getTransactions_CACHED } from "../server/cached-queries";
import { TransactionUpdateSchema } from "../utils/schemas";

type Transaction = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

export default function UpdateTransactionForm({
  accounts,
  categories,
  transaction,
  onComplete,
  className,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
  transaction: Transaction;
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const [attachments, setAttachments] = useState<DB_AttachmentType[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { execute, isExecuting } = useAction(updateTransactionAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      toast.success(data?.message);
      onComplete();
    },
  });

  const deleteAttachment = useAction(deleteTransactionAttachmentAction, {
    onError: ({ error }) => {
      toast.error(error.serverError);
    },
    onSuccess: ({ data, input }) => {
      console.log(data?.message);
      setAttachments((prev) => prev.filter((_) => _.id !== input.id));
    },
  });

  const account = accounts.find((a) => a.id === transaction.accountId);

  const form = useForm<z.infer<typeof TransactionUpdateSchema>>({
    resolver: zodResolver(TransactionUpdateSchema),
    defaultValues: {
      ...transaction,
      note: transaction?.note ?? undefined,
      attachment_ids: [],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="mb-8 flex justify-between">
          <AccountAvatar
            account={{
              name: account?.name ?? "",
              logoUrl: account?.logoUrl ?? "",
            }}
          />
          <div className="text-sm text-muted-foreground">
            {format(transaction.date, "LLL dd, yyyy")}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <h2>{transaction.description}</h2>
          <span className="font-mono text-4xl">
            {formatAmount({ amount: parseFloat(transaction.amount) })}
          </span>
        </div>

        <div className="mb-2 grid w-full grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Categoria</FormLabel>
                <CategoryPicker
                  options={categories}
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  onReset={() => {
                    form.setValue("categoryId", null);
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
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Tags</FormLabel>
                <TagsPicker
                  {...field}
                  placeholder="Enter a tag"
                  tags={field.value}
                  className="sm:min-w-[450px]"
                  setTags={field.onChange}
                  activeTagIndex={activeTagIndex}
                  setActiveTagIndex={setActiveTagIndex}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Accordion type="multiple">
          <AccordionItem value="attchament">
            <AccordionTrigger className="text-sm">Allegati</AccordionTrigger>
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
          <AccordionItem value="exclude">
            <AccordionTrigger className="text-sm">
              Escludi dalle analisi
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="exclude"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel className="mt-0 text-sm font-normal text-muted-foreground">
                      Exclude this transaction from analytics like profit,
                      expense and revenue. This is useful for internal transfers
                      between accounts to avoid double-counting.
                    </FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="recurring">
            <AccordionTrigger className="text-sm">Ricorrente</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="recurring"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-4">
                    <FormLabel className="mt-0 text-sm font-normal text-muted-foreground">
                      Mark as recurring. Similar future transactions will be
                      automatically categorized and flagged as recurring.
                    </FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="note">
            <AccordionTrigger className="text-sm">Note</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <Textarea
                        placeholder="Informazioni aggiuntive"
                        className="min-h-[100px] resize-none"
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

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button className="w-full" type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Modifico transazione...
              </>
            ) : (
              "Modifica transazione"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
