"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { CurrencyInput } from "~/components/custom/currency-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Textarea } from "~/components/ui/textarea";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { TransactionInsertSchema } from "~/lib/validators/transactions";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { type DB_AttachmentType } from "~/server/db/schema/transactions";
import { formatSize } from "~/utils/format";
import { UploadDropzone } from "~/utils/uploadthing";
import {
  createTransactionAction,
  deleteAttachmentAction,
} from "./transactions/create-transaction-action";

function AddTransactionForm({
  accounts,
  categories,
  className,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
} & React.ComponentProps<"form">) {
  const [attachments, setAttachments] = useState<DB_AttachmentType[]>([]);

  const { execute, isExecuting } = useAction(createTransactionAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione creata!");
    },
  });

  const deleteAttachment = useAction(deleteAttachmentAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data, input }) => {
      console.log(data?.message);
      setAttachments((prev) => prev.filter((_) => _.id !== input.id));
    },
  });

  const form = useForm<z.infer<typeof TransactionInsertSchema>>({
    resolver: zodResolver(TransactionInsertSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      amount: "0",
      currency: "EUR",
      category_slug: "uncategorized",
      attachment_ids: [],
    },
  });

  const category = form.watch("category_slug");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col gap-6", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="grid w-full grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(2025, 1, 11), "MMMM dd'th', yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      toDate={new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-col">
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Importo</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue);

                      if (values.floatValue && values.floatValue > 0) {
                        form.setValue("category_slug", "income");
                      }

                      if (
                        category === "income" &&
                        values.floatValue !== undefined &&
                        values.floatValue < 0
                      ) {
                        form.setValue("category_slug", undefined);
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
              <FormItem className="flex flex-col">
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
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Conto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Conto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => {
                      return (
                        <SelectItem value={account.id} key={account.id}>
                          {account.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_slug"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? "uncategorized"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => {
                      return (
                        <SelectItem value={category.id} key={category.id}>
                          {category.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
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

        <div className="flex-grow"></div>
        <Button
          className="col-span-2 mt-4"
          type="submit"
          disabled={isExecuting}
        >
          Crea Transazione
        </Button>
      </form>
    </Form>
  );
}

export default function AddPanel({
  accounts,
  categories,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
}) {
  const isMobile = useIsMobile();
  const [params, setParams] = useQueryStates({ action: parseAsString });
  const open = params.action === "add";

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={() => setParams({ action: null })}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nuova spesa o entrata</DrawerTitle>
            <DrawerDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </DrawerDescription>
          </DrawerHeader>
          <AddTransactionForm
            className="px-4"
            accounts={accounts}
            categories={categories}
          />
          <DrawerFooter>
            <DrawerClose>
              <Button variant="outline" asChild>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={() => setParams({ action: null })}>
      <SheetContent className="p-4">
        <div className="flex h-full flex-col">
          <SheetHeader className="mb-6">
            <SheetTitle>Nuova spesa o entrata</SheetTitle>
            <SheetDescription>
              Registra un movimento per tenere tutto sotto controllo.
            </SheetDescription>
          </SheetHeader>
          <AddTransactionForm accounts={accounts} categories={categories} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
