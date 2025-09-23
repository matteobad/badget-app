"use client";

import { useEffect, useState } from "react";
import { readStreamableValue } from "@ai-sdk/rsc";
import { SelectAccount } from "~/components/bank-account/forms/select-account";
import { Spinner } from "~/components/load-more";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { generateCsvMapping } from "~/server/domain/transaction/actions";
import {
  parseAmountValue,
  parseDateValue,
} from "~/server/jobs/utils/import-transactions";
import { formatAmount } from "~/shared/helpers/format";
import { capitalCase } from "change-case";
import { ArrowRightIcon, InfoIcon } from "lucide-react";
import { Controller } from "react-hook-form";

import { mappableFields, useCsvContext } from "./context";

export function FieldMapping({}: { currencies: string[] }) {
  const { fileColumns, firstRows, setValue, control, watch } = useCsvContext();
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    if (!fileColumns || !firstRows) return;

    generateCsvMapping(fileColumns, firstRows)
      .then(async ({ object }) => {
        setIsStreaming(true);

        for await (const partialObject of readStreamableValue(object)) {
          if (partialObject) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            for (const [field, value] of Object.entries(partialObject)) {
              if (
                Object.keys(mappableFields).includes(field) &&
                fileColumns.includes(value as string)
              ) {
                // @ts-expect-error fix types
                setValue(field as keyof typeof mappableFields, value, {
                  shouldValidate: true,
                });
              }
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsStreaming(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileColumns, firstRows]);

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="text-sm">CSV Data column</div>
        <div className="text-sm">Badget data column</div>
        {(Object.keys(mappableFields) as (keyof typeof mappableFields)[]).map(
          (field) => (
            <FieldRow
              key={field}
              field={field}
              isStreaming={isStreaming}
              currency={watch("currency")}
            />
          ),
        )}
      </div>

      <Accordion
        defaultValue={undefined}
        collapsible
        type="single"
        className="mt-6 w-full border-y-[1px] border-border"
      >
        <AccordionItem value="settings">
          <AccordionTrigger className="text-sm">Settings</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <Controller
                control={control}
                name="inverted"
                render={({ field: { onChange, value } }) => (
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-1">
                      <Label htmlFor="inverted">Inverted amount</Label>
                      <p className="text-sm text-[#606060]">
                        If the transactions are from credit account, you can
                        invert the amount.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Switch
                        id="inverted"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4">
        <Label className="mb-2 block">Account</Label>
        <Controller
          control={control}
          name="bank_account_id"
          render={({ field: { value, onChange } }) => (
            <SelectAccount
              className="w-full"
              selected={value}
              onChange={(account) => {
                onChange(account.id);

                if (account.type === "liability") {
                  setValue("inverted", true, {
                    shouldValidate: true,
                  });
                }
              }}
            />
          )}
        />
      </div>
    </div>
  );
}

function FieldRow({
  field,
  isStreaming,
  currency,
}: {
  field: keyof typeof mappableFields;
  isStreaming: boolean;
  currency?: string;
}) {
  const { label, required } = mappableFields[field];
  const { control, watch, fileColumns, firstRows } = useCsvContext();

  const value = watch(field);
  const inverted = watch("inverted");

  const isLoading = isStreaming && !value;

  const firstRow = firstRows?.at(0);

  const description = firstRow![value as keyof typeof firstRow];

  const formatDescription = (description?: string) => {
    if (!description) return;

    if (field === "date") {
      return parseDateValue(description);
    }

    if (field === "amount") {
      const amount = parseAmountValue({ amount: description, inverted });

      if (currency) {
        return formatAmount({ currency, amount });
      }

      return amount;
    }

    if (field === "description") {
      return capitalCase(description);
    }

    return description;
  };

  return (
    <>
      <div className="relative flex min-w-0 items-center gap-2">
        <Controller
          control={control}
          name={field}
          rules={{ required }}
          render={({ field }) => {
            return (
              <Select
                value={field?.value ?? undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="relative w-full" hideIcon={isLoading}>
                  <SelectValue placeholder={`Select ${label}`} />

                  {isLoading && (
                    <div className="absolute top-2 right-2">
                      <Spinner className="size-3.5" />
                    </div>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{label}</SelectLabel>
                    {[
                      // Filter out empty columns
                      ...(fileColumns?.filter((column) => column !== "") ?? []),
                      ...(field.value && !required ? ["None"] : []),
                    ]?.map((column) => {
                      return (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />

        <div className="flex items-center justify-end">
          <ArrowRightIcon className="size-4 text-[#878787]" />
        </div>
      </div>

      <span className="flex h-9 w-full items-center justify-between border border-border bg-transparent px-3 py-2 text-sm whitespace-nowrap">
        <div className="flex grow justify-between text-sm font-normal whitespace-nowrap text-muted-foreground">
          <span>{label}</span>

          {description && (
            <TooltipProvider delayDuration={50}>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent className="p-2 text-xs">
                  {formatDescription(description)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </span>
    </>
  );
}
