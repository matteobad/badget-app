"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Info } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod";

import { AccountPicker } from "~/components/forms/account-picker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { type DB_AccountType } from "~/server/db/schema/accounts";
import { UploadDropzone } from "~/utils/uploadthing";
import { importTransactionAction, parseCsv } from "../server/actions";
import { TransactionImportSchema } from "../utils/schemas";

const CSV_REQUIRED_FIELDS: (keyof TransactionImportSchema["fieldMapping"])[] = [
  "date",
  "description",
  "amount",
]; // Example predefined fields

export default function ImportTransactionForm({
  accounts,
  className,
}: {
  accounts: DB_AccountType[];
} & React.ComponentProps<"form">) {
  const [parsedCSV, setParsedCSV] = useState<Record<string, string>>({});

  const { execute, isExecuting } = useAction(importTransactionAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      console.log(data?.message);
      toast.success("Transazione creata!");
    },
  });

  const form = useForm<z.infer<typeof TransactionImportSchema>>({
    resolver: zodResolver(TransactionImportSchema),
    defaultValues: {
      settings: { inverted: false },
    },
  });

  const file = form.watch("file");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(execute)}
        className={cn("flex h-full flex-col gap-2", className)}
      >
        {/* <pre>
          <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
        </pre> */}

        <div className="flex w-full flex-col">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem
                className={cn("col-span-2 flex flex-col", {
                  hidden: !!field.value,
                })}
              >
                <UploadDropzone
                  className="mt-0"
                  endpoint="csvUploader"
                  onChange={async (files) => {
                    const file = files[0]!;
                    const parsedCSV = await parseCsv(file);
                    setParsedCSV(parsedCSV);
                    field.onChange(file);
                    console.log(parsedCSV);
                  }}
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    console.log("Files: ", res);
                    toast.info("Attachment caricati");
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    console.error(error.message);
                    toast.error(error.message);
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div
            className={cn(
              "mt-2 flex h-[246px] flex-col justify-between rounded border border-dashed p-4",
              {
                hidden: !file,
              },
            )}
          >
            <p className="text-sm font-light text-muted-foreground">
              {
                "We've mapped each column to what we believe is correct, but please review the data below to confirm it's accurate."
              }
            </p>

            <div className="space-y-4">
              {CSV_REQUIRED_FIELDS.map((item) => {
                return (
                  <FormField
                    key={item}
                    control={form.control}
                    name={`fieldMapping.${item}`}
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 space-y-0">
                        <Select
                          value={field.value ?? ""}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CSV column" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(parsedCSV).map((header) => (
                              <SelectItem key={header} value={header}>
                                {header}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <ArrowRight className="size-4 text-muted-foreground" />

                        <div className="flex h-10 items-center justify-between gap-2 rounded border px-3">
                          <span className="text-sm text-muted-foreground">
                            {item}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {parsedCSV[field.value] ??
                                    "Mappa la colonna per avere una preview"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormItem>
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="attchament">
            <AccordionTrigger>Impostazioni</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <FormField
                control={form.control}
                name="settings.inverted"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-y-0">
                    <FormLabel className="mt-0">Inverti importi</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-readonly
                    />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="note">
            <AccordionTrigger>Conto</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="extraFields.accountId"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 space-y-0">
                    <FormLabel>Conto</FormLabel>
                    <AccountPicker
                      options={accounts}
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grow"></div>
        <Button
          className="col-span-2 mt-4"
          type="submit"
          disabled={isExecuting}
        >
          Importa Transazioni
        </Button>
      </form>
    </Form>
  );
}
