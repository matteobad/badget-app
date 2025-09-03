import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TransactionSplitItem } from "~/shared/validators/transaction-split.schema";
import type z from "zod/v4";
import { useCallback, useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CategoryBadge } from "~/components/category/category-badge";
import { CurrencyInput } from "~/components/custom/currency-input";
import { FormatAmount } from "~/components/format-amount";
import { SubmitButton } from "~/components/submit-button";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { addTransactionSplitsSchema } from "~/shared/validators/transaction-split.schema";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TransactionCategorySelect } from "../forms/transaction-category-select";

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
    }),
  );

  const form = useForm<z.infer<typeof addTransactionSplitsSchema>>({
    resolver: standardSchemaResolver(addTransactionSplitsSchema),
    defaultValues: {
      transactionId: transaction.id,
      splits:
        existingSplits && existingSplits?.length > 0
          ? existingSplits.map((s) => ({
              id: s.id,
              category: s.category ?? undefined,
              amount: s.amount,
              note: s.note ?? undefined,
            }))
          : DEFAULT_SPLITS,
    },
  });

  const splits = form.watch("splits");

  const total = useMemo(
    () =>
      Number(
        splits.reduce((a, r) => a + (Number(r.amount) || 0), 0).toFixed(2),
      ),
    [splits],
  );

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex h-full flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex w-full items-center justify-start space-x-2">
            <Avatar className="size-10 rounded-none">
              <AvatarFallback className="rounded-none">
                {transaction.counterpartyName?.charAt(0) ??
                  transaction.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="line-clamp-1 w-full max-w-[100px] text-ellipsis md:max-w-none">
                {transaction.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {transaction.description}
              </span>
            </div>
          </div>
          <div>
            <FormatAmount
              amount={transaction.amount}
              currency={transaction.currency}
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          <div className="flex flex-col items-end gap-4">
            <div className="flex w-full items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="secondary"
                  onClick={handleAddRow}
                >
                  Aggiungi riga
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={splits.length === 2}
                  onClick={() => handleDeleteRow(splits.length - 1)}
                >
                  Rimuovi riga
                </Button>
              </div>
              <div
                className={
                  total === Number(Number(transaction.amount).toFixed(2))
                    ? "text-sm"
                    : "text-sm text-destructive"
                }
              >
                Totale:{" "}
                <FormatAmount amount={total} currency={transaction.currency} />
              </div>
            </div>
            <div className="w-full space-y-4">
              <FormField
                control={form.control}
                name="splits"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-col gap-4">
                        {field.value.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="relative w-full">
                              <FormField
                                control={form.control}
                                name={`splits.${idx}.note`}
                                render={({ field }) => (
                                  <Input
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
                                  <DropdownMenu
                                    open={categoryDropdownOpen[idx]}
                                    onOpenChange={(open) =>
                                      setCategoryDropdownOpen((p) =>
                                        p.map((o, i) => (i === idx ? open : o)),
                                      )
                                    }
                                  >
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="absolute top-0 right-0 h-auto p-0"
                                      >
                                        <CategoryBadge
                                          className="h-[36px]"
                                          category={row.category ?? undefined}
                                        />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="start"
                                      className="overflow-hidden"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <TransactionCategorySelect
                                        selectedItems={
                                          field.value?.id
                                            ? [field.value.id]
                                            : []
                                        }
                                        onSelect={(c) => {
                                          field.onChange(c);
                                          setCategoryDropdownOpen((p) =>
                                            p.map((o, i) =>
                                              i === idx ? false : o,
                                            ),
                                          );
                                        }}
                                      />
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`splits.${idx}.amount`}
                              render={({ field }) => (
                                <div className="w-[120px] space-y-2">
                                  <CurrencyInput
                                    className="text-right"
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
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <SubmitButton isSubmitting={addSplitMutation.isPending}>
            Salva divisione
          </SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  );
}
