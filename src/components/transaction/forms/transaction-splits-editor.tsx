import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CategoryBadge } from "~/components/category/category-badge";
import { CurrencyInput } from "~/components/custom/currency-input";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { toast } from "sonner";

import { TransactionCategorySelect } from "../forms/transaction-category-select";

type SplitRow = {
  id?: string;
  category?: {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  amount: number;
  note?: string;
};

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

  const [rows, setRows] = useState<SplitRow[]>([]);

  useEffect(() => {
    if (existingSplits && existingSplits.length > 0) {
      setRows(
        existingSplits.map((s) => ({
          id: s.id,
          category: s.category ?? undefined,
          amount: s.amount as unknown as number,
          note: s.note ?? undefined,
        })),
      );
      setCategoryDropdownOpen(existingSplits.map(() => false));
    } else {
      setRows([{ amount: 0 }, { amount: 0 }]);
      setCategoryDropdownOpen([false, false]);
    }
  }, [existingSplits]);

  const total = useMemo(
    () =>
      Number(rows.reduce((a, r) => a + (Number(r.amount) || 0), 0).toFixed(2)),
    [rows],
  );

  const valid =
    rows.length > 0 &&
    rows.every((r) => (r.category?.id && r.amount !== 0) ?? false) &&
    Number(total) === Number(Number(transaction.amount).toFixed(2));

  const addSplitMutation = useMutation(
    trpc.transaction.addSplit.mutationOptions({
      onSuccess: () => {
        toast.success("Splits saved");
        onSaved?.();
      },
    }),
  );

  const handleAddRow = () => setRows((p) => [...p, { amount: 0 }]);
  const handleDeleteRow = (idx: number) =>
    setRows((p) => p.filter((_, i) => i !== idx));

  const handleSave = () => {
    if (!valid) {
      toast.error("Splits must have category, positive amount and match total");
      return;
    }
    addSplitMutation.mutate({
      transactionId: transaction.id,
      splits: rows.map((r) => ({
        categoryId: r.category?.id ?? null,
        amount: Number(r.amount),
        note: r.note,
      })),
    });
  };

  return (
    <div className="flex h-full flex-col gap-6">
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
                disabled={rows.length === 2}
                onClick={() => handleDeleteRow(rows.length - 1)}
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
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="relative w-full">
                  <Input
                    placeholder="Note"
                    value={row.note ?? ""}
                    onChange={(e) =>
                      setRows((p) =>
                        p.map((r, i) =>
                          i === idx ? { ...r, note: e.target.value } : r,
                        ),
                      )
                    }
                  />
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
                          row.category?.id ? [row.category.id] : []
                        }
                        onSelect={(c) => {
                          setRows((p) =>
                            p.map((r, i) =>
                              i === idx ? { ...r, category: c } : r,
                            ),
                          );
                          setCategoryDropdownOpen((p) =>
                            p.map((o, i) => (i === idx ? false : o)),
                          );
                        }}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="w-[120px] space-y-2">
                  <CurrencyInput
                    className="text-right"
                    value={row.amount}
                    onChange={(e) =>
                      setRows((p) =>
                        p.map((r, i) =>
                          i === idx
                            ? { ...r, amount: Number(e.target.value || 0) }
                            : r,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!valid || addSplitMutation.isPending}
        >
          Salva divisione
        </Button>
      </DialogFooter>
    </div>
  );
}
