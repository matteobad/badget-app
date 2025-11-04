"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontalIcon,
  ReceiptTextIcon,
  ShareIcon,
  SplitIcon,
  TrashIcon,
} from "lucide-react";
import { memo, useCallback } from "react";
import { FormatAmount } from "~/components/format-amount";
import { Spinner } from "~/components/load-more";
import { InlineSelectCategory } from "~/components/transaction-category/inline-select-category";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { TransactionFrequencyType } from "~/shared/constants/enum";
import { formatDate } from "~/shared/helpers/format";
import { TransactionInfoTooltips } from "../transaction-info-tooltips";

type Transaction = RouterOutput["transaction"]["get"]["data"][number];
type TransactionSplit =
  RouterOutput["transaction"]["get"]["data"][number]["splits"][number];

const SelectCell = memo(
  ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => <Checkbox checked={checked} onCheckedChange={onChange} />,
);

SelectCell.displayName = "SelectCell";

const DateCell = memo(
  ({
    date,
    format,
    noSort,
  }: {
    date: string;
    format?: string | null;
    noSort?: boolean;
  }) => formatDate(date, format, noSort),
);

DateCell.displayName = "DateCell";

const DescriptionCell = memo(
  ({
    name,
    description,
    counterpartyLogo,
    recurring,
    frequency,
    excluded,
    split,
  }: {
    name: string;
    description?: string;
    counterpartyLogo?: string;
    recurring?: boolean;
    frequency?: TransactionFrequencyType;
    excluded?: boolean;
    split?: boolean;
  }) => (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-full items-center justify-between space-x-2">
            <Avatar className="size-8 rounded-none">
              <AvatarImage
                src={counterpartyLogo ?? ""}
                className="object-contain"
              />
              <AvatarFallback className="rounded-none">
                {name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="line-clamp-1 w-full max-w-[100px] text-ellipsis md:max-w-none">
              {name}
            </span>

            <TransactionInfoTooltips
              recurring={recurring}
              frequency={frequency}
              excludeFromReports={excluded}
              split={split}
            />
          </div>
        </TooltipTrigger>

        {description && (
          <TooltipContent
            className="max-w-[380px] px-3 py-1.5 text-xs"
            side="right"
            sideOffset={10}
          >
            {description}
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  ),
);

DescriptionCell.displayName = "DescriptionCell";

const AmountCell = memo(
  ({
    amount,
    currency,
    splits,
  }: {
    amount: number;
    currency: string;
    splits: TransactionSplit[];
  }) => (
    <div className="relative w-full text-right">
      {splits && splits.length > 1 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "cursor-pointer text-sm",
                amount > 0 && "text-green-600",
              )}
            >
              <FormatAmount amount={amount} currency={currency} />
            </span>
          </TooltipTrigger>
          <TooltipContent
            className="max-w-[380px] px-3 py-1.5 text-xs"
            side="top"
            sideOffset={6}
          >
            <div>
              <div className="mb-2 font-semibold">{splits.length} splits:</div>
              <ul className="space-y-1">
                {splits.map((split, idx) => (
                  <li
                    key={split.id ?? idx}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="truncate">{split.note}</span>
                    <span className="font-mono text-xs">
                      <FormatAmount amount={split.amount} currency={currency} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className={cn("text-sm", amount > 0 && "text-green-600")}>
          <FormatAmount amount={amount} currency={currency} />
        </span>
      )}
    </div>
  ),
);

AmountCell.displayName = "AmountCell";

const TagsCell = memo(
  ({ tags }: { tags?: { id: string; name: string | null }[] }) => (
    <div className="relative w-full">
      <div className="scrollbar-hide flex items-center space-x-2 overflow-x-auto">
        {tags?.map(({ id, name }) => (
          <Badge
            key={id}
            variant="tag-rounded"
            className="flex-shrink-0 whitespace-nowrap"
          >
            {name}
          </Badge>
        ))}
      </div>
      <div className="pointer-events-none top-0 right-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent group-hover:hidden" />
    </div>
  ),
);

TagsCell.displayName = "TagsCell";

const AccountCell = memo(
  ({
    bankAccount,
  }: {
    bankAccount: { id?: string; name?: string; logoUrl?: string | null };
  }) => (
    <div className="relative flex w-full items-center gap-2">
      <Avatar className="size-6 rounded-none">
        <AvatarImage
          src={bankAccount?.logoUrl ?? ""}
          className="object-contain"
        />
        <AvatarFallback className="rounded-none">
          {bankAccount?.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{bankAccount?.name}</span>
    </div>
  ),
);

AccountCell.displayName = "AccountCell";

const ActionsCell = memo(
  ({
    transaction,
    onViewDetails,
    onSplitTransaction,
    onCopyUrl,
    onDeleteTransactionSplit,
    onDeleteTransaction,
  }: {
    transaction: Transaction;
    onViewDetails?: (id: string) => void;
    onSplitTransaction?: (id: string) => void;
    onCopyUrl?: (id: string) => void;
    onDeleteTransactionSplit?: (id: string) => void;
    onDeleteTransaction?: (id: string) => void;
  }) => {
    const handleViewDetails = useCallback(() => {
      onViewDetails?.(transaction.id);
    }, [transaction.id, onViewDetails]);

    const handleSplitTransaction = useCallback(() => {
      onSplitTransaction?.(transaction.id);
    }, [transaction.id, onSplitTransaction]);

    const handleCopyUrl = useCallback(() => {
      onCopyUrl?.(transaction.id);
    }, [transaction.id, onCopyUrl]);

    const handleDeleteTransactionSplit = useCallback(() => {
      onDeleteTransactionSplit?.(transaction.id);
    }, [transaction.id, onDeleteTransactionSplit]);

    const handleDeleteTransaction = useCallback(() => {
      onDeleteTransaction?.(transaction.id);
    }, [transaction.id, onDeleteTransaction]);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleViewDetails}>
            <ReceiptTextIcon className="size-3.5" />
            View details
          </DropdownMenuItem>
          {!transaction.splits.length && (
            <DropdownMenuItem onClick={handleSplitTransaction}>
              <SplitIcon className="size-3.5" />
              Split transaction
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleCopyUrl}>
            <ShareIcon className="size-3.5" />
            Share URL
          </DropdownMenuItem>

          {(transaction.splits.length > 0 || transaction.source !== "api") && (
            <DropdownMenuSeparator />
          )}

          {transaction.splits.length > 0 && (
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDeleteTransactionSplit}
            >
              <TrashIcon className="size-3.5" />
              Elimina Splits
            </DropdownMenuItem>
          )}
          {transaction.source !== "api" && (
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDeleteTransaction}
            >
              <TrashIcon className="size-3.5" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

ActionsCell.displayName = "ActionsCell";

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    meta: {
      className:
        "md:sticky bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-10 border-r border-border before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:right-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row }) => (
      <SelectCell
        checked={row.getIsSelected()}
        onChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      className:
        "md:sticky bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-10 border-r border-border before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:right-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row, table }) => (
      <DateCell
        date={row.original.date}
        format={table.options.meta?.dateFormat}
        noSort={!table.options.meta?.hasSorting}
      />
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    meta: {
      className:
        "md:sticky bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-10 border-r border-border before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:right-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row }) => (
      <DescriptionCell
        name={row.original.name}
        description={row.original.description ?? undefined}
        recurring={row.original.recurring ?? undefined}
        frequency={row.original.frequency ?? undefined}
        excluded={Boolean(
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          row.original.internal || row.original.category?.excluded,
        )}
        split={row.original.splits.length > 0}
      />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row, table }) => {
      // Show analyzing state when enrichment is not completed
      if (!row.original.enrichmentCompleted) {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2 cursor-help">
                <Spinner size={14} className="stroke-primary" />
                <span className="text-[#878787] text-sm">Analyzing</span>
              </div>
            </TooltipTrigger>
            <TooltipContent
              className="px-3 py-1.5 text-xs max-w-[280px]"
              side="top"
              sideOffset={5}
            >
              Analyzing transaction details to determine the best category.
            </TooltipContent>
          </Tooltip>
        );
      }

      const meta = table.options.meta;

      return (
        <InlineSelectCategory
          selected={
            row.original.category
              ? {
                  id: row.original.category.id,
                  name: row.original.category.name,
                  color: row.original.category.color,
                  slug: row.original.category.slug ?? "",
                }
              : undefined
          }
          onChange={(category) => {
            meta?.updateTransaction?.({
              id: row.original.id,
              categorySlug: category.slug,
              categoryName: category.name,
            });
          }}
        />
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    meta: {
      className: "w-[280px] max-w-[280px]",
    },
    cell: ({ row }) => <TagsCell tags={row.original.tags} />,
  },
  {
    accessorKey: "bank_account",
    header: "Account",
    cell: ({ row }) => <AccountCell bankAccount={row.original.account} />,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <AmountCell
        amount={row.original.amount}
        currency={row.original.currency}
        splits={row.original.splits}
      />
    ),
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    meta: {
      className:
        "text-right md:sticky md:right-0 bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:left-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-r after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta;

      return (
        <ActionsCell
          transaction={row.original}
          onViewDetails={meta?.setOpen}
          onSplitTransaction={meta?.splitTransaction}
          onCopyUrl={meta?.copyUrl}
          onDeleteTransactionSplit={meta?.deleteTransactionSplit}
          onDeleteTransaction={meta?.deleteTransaction}
        />
      );
    },
  },
];
