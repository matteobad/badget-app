"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import NumberFlow from "@number-flow/react";
import { useSpaceMutation, useSpaceQuery } from "~/hooks/use-space";
import { useUserQuery } from "~/hooks/use-user";
import { useExportStore } from "~/lib/stores/export";
import { useTransactionsStore } from "~/lib/stores/transaction";
import { exportTransactionsAction } from "~/server/domain/transaction/actions";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Spinner } from "../load-more";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";

const exportSettingsSchema = z
  .object({
    csvDelimiter: z.string(),
    includeCSV: z.boolean(),
    includeXLSX: z.boolean(),
    sendEmail: z.boolean(),
    accountantEmail: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.sendEmail) {
        if (!data.accountantEmail || data.accountantEmail.trim() === "") {
          return false;
        }

        return z.email().safeParse(data.accountantEmail.trim()).success;
      }
      return true;
    },
    {
      message: "Please enter a valid email address",
      path: ["accountantEmail"],
    },
  )
  .refine((data) => data.includeCSV || data.includeXLSX, {
    message: "Please select at least one export format",
  });

interface ExportTransactionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportTransactionsModal({
  isOpen,
  onOpenChange,
}: ExportTransactionsModalProps) {
  const { setExportData, setIsExporting } = useExportStore();
  const { rowSelection, setRowSelection } = useTransactionsStore();
  const { data: user } = useUserQuery();
  const { data: space } = useSpaceQuery();
  const spaceMutation = useSpaceMutation();

  const ids = Object.keys(rowSelection);
  const totalSelected = ids.length;

  // Load saved settings from team
  const savedSettings = (space?.exportSettings as unknown as z.infer<
    typeof exportSettingsSchema
  >) ?? {
    csvDelimiter: ",",
    includeCSV: true,
    includeXLSX: true,
    sendEmail: false,
    accountantEmail: "",
  };

  const form = useForm<z.infer<typeof exportSettingsSchema>>({
    resolver: zodResolver(exportSettingsSchema),
    defaultValues: savedSettings,
    mode: "onChange",
  });

  // Update form when team data changes
  useEffect(() => {
    if (space?.exportSettings) {
      form.reset(space.exportSettings as z.infer<typeof exportSettingsSchema>);
    }
  }, [space?.exportSettings, form]);

  const { execute, status } = useAction(exportTransactionsAction, {
    onSuccess: ({ data }) => {
      if (data?.id && data?.publicAccessToken) {
        setExportData({
          runId: data.id,
          accessToken: data.publicAccessToken,
        });

        setRowSelection(() => ({}));
        setIsExporting(false);
      }

      onOpenChange(false);
    },
    onError: () => {
      setIsExporting(false);
    },
  });

  const onSubmit = async (values: z.infer<typeof exportSettingsSchema>) => {
    setIsExporting(true);

    await spaceMutation.mutateAsync({
      exportSettings: values,
    });

    execute({
      transactionIds: ids,
      dateFormat: user?.dateFormat ?? undefined,
      locale: user?.locale ?? undefined,
      exportSettings: values,
    });
  };

  const isExporting = status === "executing";
  const sendEmail = form.watch("sendEmail");
  const includeCSV = form.watch("includeCSV");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DialogHeader className="mb-8">
                <DialogTitle>Export Transactions</DialogTitle>
                <DialogDescription>
                  Export <NumberFlow value={totalSelected} /> selected
                  transactions with your preferred settings. You&apos;ll be
                  notified when ready.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="includeCSV"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-normal">
                            CSV
                          </FormLabel>
                          <p className="text-xs text-[#878787]">
                            Export as comma-separated values
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {includeCSV && (
                  <FormField
                    control={form.control}
                    name="csvDelimiter"
                    render={({ field }) => (
                      <Accordion type="single" collapsible className="-mx-4">
                        <AccordionItem
                          value="csv-settings"
                          className="border-0"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 hover:no-underline">
                            <span className="text-sm text-[#878787]">
                              CSV Settings
                            </span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4">
                            <FormItem>
                              <div className="space-y-2 pt-2">
                                <FormLabel
                                  htmlFor="delimiter"
                                  className="text-sm"
                                >
                                  Delimiter
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="flex gap-4"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="," id="comma" />
                                      <Label
                                        htmlFor="comma"
                                        className="text-sm font-normal"
                                      >
                                        Comma (,)
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value=";"
                                        id="semicolon"
                                      />
                                      <Label
                                        htmlFor="semicolon"
                                        className="text-sm font-normal"
                                      >
                                        Semicolon (;)
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem value="\t" id="tab" />
                                      <Label
                                        htmlFor="tab"
                                        className="text-sm font-normal"
                                      >
                                        Tab
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                              </div>
                            </FormItem>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="includeXLSX"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-normal">
                            Excel (XLSX)
                          </FormLabel>
                          <p className="text-xs text-[#878787]">
                            Export as Excel spreadsheet
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="sendEmail"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-normal">
                            Send via email
                          </FormLabel>
                          <p className="text-xs text-[#878787]">
                            Email the export to your accountant
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                {sendEmail && (
                  <FormField
                    control={form.control}
                    name="accountantEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="accountant@example.com"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isExporting || form.formState.isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isExporting ||
                    !form.formState.isValid ||
                    form.formState.isSubmitting
                  }
                >
                  {isExporting ? (
                    <div className="flex items-center space-x-2">
                      <Spinner className="size-4" />
                      <span>Exporting...</span>
                    </div>
                  ) : (
                    <span>Export</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
