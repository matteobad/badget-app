import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CategoryBadge } from "~/components/category/category-badge";
import { FormatAmount } from "~/components/format-amount";
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
  transactionId: string;
  transactionAmount: number;
  currency: string;
  onSaved?: () => void;
};

export function TransactionSplitsEditor({
  transactionId,
  transactionAmount,
  currency,
  onSaved,
}: Props) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  const trpc = useTRPC();

  const { data: existingSplits } = useQuery(
    trpc.transaction.getSplits.queryOptions({ transactionId }),
  );

  const [rows, setRows] = useState<SplitRow[]>([]);

  useEffect(() => {
    if (existingSplits) {
      setRows(
        existingSplits.map((s) => ({
          id: s.id,
          category: s.category ?? undefined,
          amount: s.amount as unknown as number,
          note: s.note ?? undefined,
        })),
      );
    } else {
      setRows([{ amount: 0 }]);
    }
  }, [existingSplits]);

  const total = useMemo(
    () =>
      Number(rows.reduce((a, r) => a + (Number(r.amount) || 0), 0).toFixed(2)),
    [rows],
  );

  const valid =
    rows.length > 0 &&
    rows.every((r) => (r.category?.id && r.amount > 0) ?? false) &&
    Number(total) === Number(Number(transactionAmount).toFixed(2));

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
      transactionId,
      splits: rows.map((r) => ({
        categoryId: r.category?.id ?? null,
        amount: Number(r.amount),
        note: r.note,
      })),
    });
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Transaction total:{" "}
          <FormatAmount amount={transactionAmount} currency={currency} />
        </div>
        <div
          className={
            total === Number(Number(transactionAmount).toFixed(2))
              ? "text-sm"
              : "text-sm text-destructive"
          }
        >
          Current sum: <FormatAmount amount={total} currency={currency} />
        </div>
      </div>
      <Separator />
      <ScrollArea className="max-h-80 pr-2">
        <div className="space-y-3">
          {rows.map((row, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <DropdownMenu
                open={categoryDropdownOpen}
                onOpenChange={setCategoryDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0">
                    <CategoryBadge category={row.category ?? undefined} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TransactionCategorySelect
                    selectedItems={row.category?.id ? [row.category.id] : []}
                    onSelect={(c) =>
                      setRows((p) =>
                        p.map((r, i) =>
                          i === idx ? { ...r, categoryId: c?.id } : r,
                        ),
                      )
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="space-y-2">
                <Input
                  value={row.note ?? ""}
                  onChange={(e) =>
                    setRows((p) =>
                      p.map((r, i) =>
                        i === idx ? { ...r, note: e.target.value } : r,
                      ),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Input
                  inputMode="decimal"
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

              <div className="col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-6"
                  onClick={() => handleDeleteRow(idx)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button type="button" variant="secondary" onClick={handleAddRow}>
              Add row
            </Button>
          </div>
        </div>
      </ScrollArea>
      <DialogFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!valid || addSplitMutation.isPending}
        >
          Save splits
        </Button>
      </DialogFooter>
    </div>
  );
}
