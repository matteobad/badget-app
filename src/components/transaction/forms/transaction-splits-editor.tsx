import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TransactionSplitItem } from "~/shared/validators/transaction-split.schema";
import type z from "zod/v4";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CurrencyInput } from "~/components/custom/currency-input";
import { FormatAmount } from "~/components/format-amount";
import { SubmitButton } from "~/components/submit-button";
import { SelectCategory } from "~/components/transaction-category/select-category";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { useTransactionParams } from "~/hooks/use-transaction-params";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { addTransactionSplitsSchema } from "~/shared/validators/transaction-split.schema";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const DEFAULT_SPLITS: TransactionSplitItem[] = [
  { amount: 0 },
  { amount: 0 },
] as const;

type Props = {
  transaction: NonNullable<RouterOutput["transaction"]["getById"]>;
  onSaved?: () => void;
};

export function TransactionSplitsEditor({ transaction, onSaved }: Props) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<boolean[]>(
    [],
  );

  const { setParams } = useTransactionParams();

  const trpc = useTRPC();

  const { data: existingSplits } = useQuery(
    trpc.transaction.getSplits.queryOptions({ transactionId: transaction.id }),
  );

  const addSplitMutation = useMutation(
    trpc.transaction.addSplit.mutationOptions({
      onSuccess: () => {
        toast.success("Split registrato correttamente");
        onSaved?.();
      },
      onError: (error) => {
        toast.error(error.message);
        onSaved?.();
      },
    }),
  );

  const form = useForm<z.infer<typeof addTransactionSplitsSchema>>({
    resolver: standardSchemaResolver(addTransactionSplitsSchema),
    defaultValues: {
      transactionId: transaction.id,
      splits:
        existingSplits && existingSplits?.length > 0
          ? existingSplits.map((s) => ({
              category: s.category ?? undefined,
              amount: s.amount,
              note: s.note ?? undefined,
            }))
          : DEFAULT_SPLITS,
    },
  });

  const splits = form.watch("splits");
  const splitsJSON = JSON.stringify(splits);

  // Use a stringified version of splits to ensure sub-property changes trigger recalculation
  const total = useMemo(() => {
    return splits.reduce((a, r) => a + r.amount, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [splitsJSON, splits]);

  const autoCompleteSplits = useCallback(() => {
    const transactionAmount = Number(Number(transaction.amount).toFixed(2));
    const currentSplits = [...splits];

    // Check which splits are dirty or touched using React Hook Form state
    const dirtyOrTouchedSplits = currentSplits.map((_, index) => {
      const fieldState = form.getFieldState(`splits.${index}.amount`);
      return fieldState.isDirty || fieldState.isTouched;
    });

    const cleanSplits = currentSplits.filter(
      (_, index) => !dirtyOrTouchedSplits[index],
    );

    // If more than 1 split is not dirty/touched, don't adjust anything
    if (cleanSplits.length > 1) {
      return;
    }

    // If only 1 split is not dirty/touched, adjust it to the remaining amount
    if (cleanSplits.length === 1) {
      const dirtyAmount = currentSplits
        .filter((_, index) => dirtyOrTouchedSplits[index])
        .reduce((sum, split) => sum + (Number(split.amount) || 0), 0);

      const remainingAmount = transactionAmount - dirtyAmount;

      // Find the clean split and update it
      const cleanSplitIndex = currentSplits.findIndex(
        (_, index) => !dirtyOrTouchedSplits[index],
      );

      if (cleanSplitIndex !== -1) {
        // Update the specific split amount directly to ensure proper re-rendering
        form.setValue(`splits.${cleanSplitIndex}.amount`, remainingAmount, {
          shouldValidate: true,
          shouldDirty: false, // Don't mark as dirty since this is auto-completion
        });
      }
    }
  }, [splits, transaction.amount, form]);

  const handleAddRow = () => {
    form.setValue("splits", [...splits, { amount: 0 }]);
    setCategoryDropdownOpen([...categoryDropdownOpen, false]);
  };

  const handleDeleteRow = (idx: number) => {
    form.setValue(
      "splits",
      splits.filter((_, i) => i !== idx),
    );
    setCategoryDropdownOpen(categoryDropdownOpen.filter((_, i) => i !== idx));
  };

  const handleSubmit = (data: z.infer<typeof addTransactionSplitsSchema>) => {
    addSplitMutation.mutate(data);
  };

  useEffect(() => {
    if (!existingSplits?.length) return;

    existingSplits.forEach((s, idx) => {
      form.setValue(`splits.${idx}.category`, s.category ?? undefined);
      form.setValue(`splits.${idx}.amount`, s.amount);
      form.setValue(`splits.${idx}.note`, s.note ?? undefined);
    });
  }, [existingSplits, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex h-full flex-col gap-8"
      >
        <div className="grid grid-cols-[1fr_auto] grid-rows-2 items-center gap-x-8 gap-y-1 px-3 font-mono text-sm">
          <span className="text-muted-foreground">Description</span>
          {/* <span className="text-muted-foreground">Date</span> */}
          <span className="text-right text-muted-foreground">Amount</span>

          <span className="line-clamp-1 text-ellipsis">
            {transaction.name || transaction.description}
          </span>
          {/* <span>{formatDate(transaction.date)}</span> */}
          <span className="text-right">
            <FormatAmount
              amount={transaction.amount}
              currency={transaction.currency}
            />
          </span>
        </div>

        <ScrollArea className="max-h-80">
          <div className="flex flex-col items-end gap-3">
            <div className="w-full space-y-4">
              <FormField
                control={form.control}
                name="splits"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-3">
                        {splits.map((row, idx) => (
                          <React.Fragment key={idx}>
                            <div className="flex items-center gap-3">
                              <div className="relative w-full">
                                <FormField
                                  control={form.control}
                                  name={`splits.${idx}.note`}
                                  render={({ field }) => (
                                    <Input
                                      className="border-transparent font-mono text-muted-foreground shadow-none transition-all hover:border-input"
                                      autoFocus={idx === 0}
                                      placeholder="Note"
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`splits.${idx}.category`}
                                  render={({ field }) => (
                                    <SelectCategory
                                      selected={field.value}
                                      onChange={(c) => {
                                        field.onChange(c);
                                        setCategoryDropdownOpen(() =>
                                          splits.map(() => false),
                                        );
                                      }}
                                    />
                                  )}
                                />
                              </div>

                              <FormField
                                control={form.control}
                                name={`splits.${idx}.amount`}
                                render={({ field }) => (
                                  <div className="w-[105px] shrink-0 space-y-2">
                                    <CurrencyInput
                                      className="border-transparent text-right font-mono text-muted-foreground shadow-none transition-all hover:border-input"
                                      placeholder="0,00"
                                      value={field.value}
                                      onValueChange={(values) => {
                                        field.onChange(values.floatValue);
                                      }}
                                      onBlur={() => {
                                        // Auto-complete other splits if possible
                                        autoCompleteSplits();
                                      }}
                                    />
                                  </div>
                                )}
                              />
                            </div>
                            <Separator />
                          </React.Fragment>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full items-center justify-between">
              <div className="grow"></div>
              <div
                className={cn(
                  "flex items-center justify-between pt-2 pr-3 font-mono text-sm",
                  total !== Number(Number(transaction.amount).toFixed(2)) &&
                    "text-destructive",
                )}
              >
                <span className="pr-2 text-muted-foreground">Totale</span>
                <div className="w-[100px] text-right text-base">
                  <FormatAmount
                    amount={total}
                    currency={transaction.currency}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <div className="flex w-full justify-between">
            <div className="flex gap-2">
              <Button
                size="icon"
                type="button"
                variant="outline"
                onClick={handleAddRow}
              >
                <PlusIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={splits.length === 2}
                onClick={() => handleDeleteRow(splits.length - 1)}
              >
                <MinusIcon className="size-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  void setParams({ splitTransaction: null });
                }}
              >
                Annulla
              </Button>
              <SubmitButton isSubmitting={addSplitMutation.isPending}>
                Salva divisione
              </SubmitButton>
            </div>
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
