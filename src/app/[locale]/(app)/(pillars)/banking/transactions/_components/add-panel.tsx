"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { type Tag } from "emblor";
import { CalendarIcon, Loader2Icon, X } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { parseAsString, useQueryStates } from "nuqs";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { CurrencyInput } from "~/components/custom/currency-input";
import { AccountPicker } from "~/components/forms/account-picker";
import { CategoryPicker } from "~/components/forms/category-picker";
import TagsPicker from "~/components/forms/tags-picker";
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
import { TransactionInsertSchema } from "~/lib/validators";
import {
  createTransactionAction,
  deleteAttachmentAction,
} from "~/server/actions";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { type DB_CategoryType } from "~/server/db/schema/categories";
import { type DB_AttachmentType } from "~/server/db/schema/transactions";
import { formatSize } from "~/utils/format";
import { UploadDropzone } from "~/utils/uploadthing";

function AddTransactionForm({
  accounts,
  categories,
  onComplete,
  className,
}: {
  accounts: DB_AccountType[];
  categories: DB_CategoryType[];
  onComplete: () => void;
} & React.ComponentProps<"form">) {
  const [attachments, setAttachments] = useState<DB_AttachmentType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  const { execute, isExecuting, reset } = useAction(createTransactionAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione creata!");
      reset();
      onComplete();
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

  const incomeId = categories.find((c) => c.slug === "income")!.id;

  const form = useForm<z.infer<typeof TransactionInsertSchema>>({
    resolver: zodResolver(TransactionInsertSchema),
    defaultValues: {
      date: new Date(),
      description: "",
      amount: "0",
      currency: "EUR",
      accountId: accounts[0]?.id ?? undefined,
      categoryId: null,
      attachment_ids: [],
    },
  });

  const category = form.watch("categoryId");

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
                      {format(field.value, "MMMM dd'th', yyyy")}
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
                        form.setValue("categoryId", incomeId);
                      }

                      if (
                        category === incomeId &&
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
                <AccountPicker
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                  options={accounts}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Categoria</FormLabel>
                <CategoryPicker
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? undefined}
                  options={categories}
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
                  tags={tags}
                  className="sm:min-w-[450px]"
                  setTags={(newTags) => {
                    setTags(newTags);
                    form.setValue("tags", newTags as [Tag, ...Tag[]]);
                    console.log(newTags);
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

        <div className="grow"></div>
        <div className="flex items-center gap-4">
          <Button className="w-full" type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Creo transazione...
              </>
            ) : (
              "Aggiungi transazione"
            )}
          </Button>
        </div>
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

  const handleClose = () => {
    void setParams({ action: null });
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
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
            onComplete={handleClose}
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
          <AddTransactionForm
            accounts={accounts}
            categories={categories}
            onComplete={handleClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
