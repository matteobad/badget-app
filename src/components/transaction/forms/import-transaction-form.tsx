"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AccountPicker } from "~/components/forms/account-picker";
import { SubmitButton } from "~/components/submit-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
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
import { useSyncStatus } from "~/hooks/use-sync-status";
import { cn } from "~/lib/utils";
import {
  importTransactionsCSVAction,
  parseTransactionsCSVAction,
} from "~/server/domain/transaction/actions";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { importTransactionSchema } from "~/shared/validators/transaction.schema";
import { UploadDropzone } from "~/utils/uploadthing";
import { ArrowRight, Info } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type z } from "zod/v4";

const CSV_REQUIRED_FIELDS: (keyof z.infer<
  typeof importTransactionSchema
>["fieldMapping"])[] = ["date", "description", "amount"]; // Example predefined fields

export default function ImportTransactionForm({
  className,
}: {} & React.ComponentProps<"form">) {
  const [parsedCSV, setParsedCSV] = useState<Record<string, string>>({});
  const [runId, setRunId] = useState<string | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [isImporting, setIsImporting] = useState(false);

  const { status, setStatus } = useSyncStatus({ runId, accessToken });

  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const parseCSVAction = useAction(parseTransactionsCSVAction, {
    onError: ({ error }) => {
      console.error(error);
      toast.error(error.serverError);
    },
    onSuccess: ({ data }) => {
      if (!data) return toast.error("Something went wrong parsing your CSV");
      setParsedCSV(data);
    },
  });

  const importCSVAction = useAction(importTransactionsCSVAction, {
    onSuccess: ({ data }) => {
      if (data) {
        setRunId(data.id);
        setAccessToken(data.publicAccessToken);
      }
    },
    onError: () => {
      setIsImporting(false);
      setRunId(undefined);
      setStatus("FAILED");
      toast.error("Something went wrong please try again.");
    },
  });

  const form = useForm<z.infer<typeof importTransactionSchema>>({
    resolver: zodResolver(importTransactionSchema),
    defaultValues: {
      fieldMapping: { currency: "EUR" },
      settings: { inverted: false },
    },
  });

  const { data: accounts } = useQuery(trpc.bankAccount.get.queryOptions({}));

  const file = form.watch("file");

  useEffect(() => {
    if (status === "FAILED") {
      setIsImporting(false);
      setRunId(undefined);
      toast.error("Something went wrong please try again or contact support.");
    }
  }, [status]);

  useEffect(() => {
    if (status === "COMPLETED") {
      setRunId(undefined);
      setIsImporting(false);

      void queryClient.invalidateQueries({
        queryKey: trpc.transaction.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.bankAccount.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.bankConnection.get.queryKey(),
      });

      void queryClient.invalidateQueries({
        queryKey: trpc.metrics.pathKey(),
      });

      toast.success("Transactions imported successfully.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(importCSVAction.execute)}
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
                  disabled={parseCSVAction.isExecuting}
                  onChange={async (files) => {
                    const file = files[0]!;
                    field.onChange(file);
                    parseCSVAction.execute({ file });
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

        <Accordion type="single" collapsible defaultValue="account">
          <AccordionItem value="settings">
            <AccordionTrigger>Impostazioni</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <FormField
                control={form.control}
                name="settings.inverted"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="mt-0">Inverti importi</FormLabel>
                    <div className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5 pr-4">
                        <p className="text-sm text-[#606060]">
                          If the transactions are from credit account, you can
                          invert the amount.
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-readonly
                      />
                    </div>
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger>Conto</AccordionTrigger>
            <AccordionContent>
              <FormField
                control={form.control}
                name="extraFields.accountId"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between gap-4 space-y-0">
                    <AccountPicker
                      options={accounts ?? []}
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
        <SubmitButton isSubmitting={isImporting} className="col-span-2 mt-4">
          Importa Transazioni
        </SubmitButton>
        {/* {file && (
          <Button
            type="button"
            variant="ghost"
            className="col-span-2"
            onClick={() => {
              setParsedCSV({});
              form.reset();
            }}
          >
            Choose another file
          </Button>
        )} */}
      </form>
    </Form>
  );
}
