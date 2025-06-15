import type { dynamicIconImports } from "lucide-react/dynamic";
import * as React from "react";
import { SelectTrigger } from "@radix-ui/react-select";
import { Portal } from "~/components/custom/portal";
import { Kbd } from "~/components/kbd";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { type getCategories_CACHED } from "~/features/category/server/cached-queries";
import { exportTableToCSV } from "~/utils/export";
import { Download, Loader, ShapesIcon, Trash2, X } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import type { Table } from "@tanstack/react-table";
import { updateTransactionBulkAction } from "../../server/actions";
import { type getTransactions_CACHED } from "../../server/cached-queries";

export type TransactionType = Awaited<
  ReturnType<typeof getTransactions_CACHED>
>["data"][number];

export function TransactionsTableFloatingBar({
  table,
  categories,
}: {
  table: Table<TransactionType>;
  categories: Awaited<ReturnType<typeof getCategories_CACHED>>;
}) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const { isExecuting, execute } = useAction(updateTransactionBulkAction, {
    onSuccess: ({ data }) => toast.success(data?.message),
    onError: ({ error }) => toast.error(error.serverError),
  });

  const [isPending, startTransition] = React.useTransition();
  const [action, setAction] = React.useState<
    "update-category" | "update-account" | "export" | "delete"
  >();

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <Portal>
      <div className="fixed right-6 bottom-6 z-50 mx-auto w-fit px-2.5">
        <div className="w-full overflow-x-auto">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-2 text-foreground shadow">
            <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
              <span className="text-xs whitespace-nowrap">
                {rows.length} selezionate
              </span>
              <Separator orientation="vertical" className="mr-1 ml-2" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 hover:border"
                    onClick={() => table.toggleAllRowsSelected(false)}
                  >
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                  <p className="mr-2">Pulisci</p>
                  <Kbd abbrTitle="Escape" variant="outline">
                    Esc
                  </Kbd>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <div className="flex items-center gap-1.5">
              <Select
                onValueChange={(value) => {
                  execute({
                    ids: rows.map((row) => row.original.id),
                    categoryId: value,
                  });
                }}
              >
                <Tooltip>
                  <SelectTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                        disabled={isExecuting}
                      >
                        {isExecuting ? (
                          <Loader
                            className="size-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <ShapesIcon className="size-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </TooltipTrigger>
                  </SelectTrigger>
                  <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                    <p>Cambia categoria</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent align="center">
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        className="capitalize"
                      >
                        <div className="flex items-center gap-2">
                          <DynamicIcon
                            size={16}
                            name={
                              category.icon as keyof typeof dynamicIconImports
                            }
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    onClick={() => {
                      setAction("export");

                      startTransition(() => {
                        exportTableToCSV(table, {
                          excludeColumns: ["select", "actions"],
                          onlySelected: true,
                        });
                      });
                    }}
                    disabled={isPending}
                  >
                    {isPending && action === "export" ? (
                      <Loader
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Download className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Export tasks</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    onClick={() => {
                      setAction("delete");

                      startTransition(async () => {
                        // const { error } = await deleteTasks({
                        //   ids: rows.map((row) => row.original.id),
                        // });

                        // if (error) {
                        //   toast.error(error);
                        //   return;
                        // }

                        table.toggleAllRowsSelected(false);
                      });
                    }}
                    disabled={isPending}
                  >
                    {isPending && action === "delete" ? (
                      <Loader
                        className="size-3.5 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Delete tasks</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
