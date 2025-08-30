"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import { memo, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryBadge } from "~/components/category/category-badge";
import { FormatAmount } from "~/components/format-amount";
import { Spinner } from "~/components/load-more";
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
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { formatDate } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { EyeOffIcon, MoreHorizontalIcon, RepeatIcon } from "lucide-react";
import { toast } from "sonner";

import type { ColumnDef } from "@tanstack/react-table";
import { TransactionCategorySelect } from "../forms/transaction-category-select";
import { SimilarTransactionsUpdateToast } from "../similar-transactions-update-toast";

type Transaction = RouterOutput["transaction"]["get"]["data"][number];
type Category = RouterOutput["transactionCategory"]["getAll"][number];

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
    status,
  }: {
    name: string;
    description?: string;
    status?: string;
    counterpartyLogo?: string;
    recurring?: boolean | null;
    frequency?: string | null;
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
            <span className="line-clamp-1 max-w-[100px] text-ellipsis md:max-w-none">
              {name}
            </span>
            {recurring && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RepeatIcon className="size-3.5 shrink-0 cursor-auto text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent
                    className="w-[220px] text-left text-xs"
                    side="right"
                  >
                    Questa transazione è ricorrente, con periodicità {frequency}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <span className="flex-1"></span>
            {status === "pending" && (
              <>
                <div className="flex h-[22px] items-center space-x-1 rounded-md border px-2 py-1 text-[10px] text-[#878787]">
                  <span>Pending</span>
                </div>
              </>
            )}
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
    internal,
  }: {
    amount: number;
    currency: string;
    internal: boolean;
  }) => (
    <div className="relative w-full text-right">
      <span className={cn("mr-9 text-sm", amount > 0 && "text-green-600")}>
        <FormatAmount amount={amount} currency={currency} />
      </span>
      {internal && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-0 -bottom-0.5 flex size-6 cursor-auto items-center justify-center">
                <EyeOffIcon className="size-3.5 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent
              className="w-[200px] text-left text-xs"
              side="right"
            >
              Questa transazione è esclusa, anche se la categoria è attiva
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  ),
);

AmountCell.displayName = "AmountCell";

const CategoryCell = memo(
  ({
    transaction,
    category,
  }: {
    transaction: Transaction;
    category?: {
      id: string;
      slug: string;
      name: string;
      color: string | null;
      icon: string | null;
      excludeFromAnalytics: boolean | null;
    };
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const queryClient = useQueryClient();
    const trpc = useTRPC();

    const updateTransactionCategoryMutation = useMutation(
      trpc.transaction.updateTransaction.mutationOptions({
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: trpc.transaction.get.infiniteQueryKey(),
          });
        },
      }),
    );

    const handleTransactionCategoryUpdate = async (category?: Category) => {
      updateTransactionCategoryMutation.mutate({
        id: transaction.id,
        categoryId: category?.id,
      });

      setIsOpen(false);

      const similarTransactions = await queryClient.fetchQuery(
        trpc.transaction.getSimilarTransactions.queryOptions(
          {
            transactionId: transaction.id,
            name: transaction.name,
            categorySlug: category?.slug,
          },
          { enabled: !!category },
        ),
      );

      if (
        category &&
        similarTransactions?.length &&
        similarTransactions.length > 1
      ) {
        toast.custom(
          (t) => (
            <SimilarTransactionsUpdateToast
              toastId={t}
              similarTransactions={similarTransactions}
              transactionId={transaction.id}
              category={category}
            />
          ),
          { duration: 6000 },
        );
      }
    };

    return (
      <div className="flex items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-0">
              <CategoryBadge category={category} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionCategorySelect
              selectedItems={category ? [category.id] : []}
              onSelect={handleTransactionCategoryUpdate}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        {category?.excludeFromAnalytics && (
          <span className="text-sm text-muted-foreground">(Excluded)</span>
        )}
        {updateTransactionCategoryMutation.isPending && <Spinner />}
      </div>
    );
  },
);

CategoryCell.displayName = "CategoryCell";

const TagsCell = memo(
  ({ tags }: { tags?: { id: string; text: string | null }[] }) => (
    <div className="relative w-full">
      <div className="scrollbar-hide flex items-center space-x-2 overflow-x-auto">
        {tags?.map(({ id, text }) => (
          <Badge
            key={id}
            variant="tag-rounded"
            className="flex-shrink-0 whitespace-nowrap"
          >
            {text}
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
    onCopyUrl,
    onDeleteTransaction,
  }: {
    transaction: Transaction;
    onViewDetails?: (id: string) => void;
    onCopyUrl?: (id: string) => void;
    onDeleteTransaction?: (id: string) => void;
  }) => {
    const handleViewDetails = useCallback(() => {
      onViewDetails?.(transaction.id);
    }, [transaction.id, onViewDetails]);

    const handleCopyUrl = useCallback(() => {
      onCopyUrl?.(transaction.id);
    }, [transaction.id, onCopyUrl]);

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
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyUrl}>Share URL</DropdownMenuItem>
          <DropdownMenuSeparator />
          {transaction.source !== "api" && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDeleteTransaction}
            >
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
        status={row.original.status ?? undefined}
        recurring={row.original.recurring ?? undefined}
        frequency={row.original.frequency ?? undefined}
      />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    meta: {
      className: "border-l border-border",
    },
    cell: ({ row }) => (
      <CategoryCell
        transaction={row.original}
        category={row.original.category!}
      />
    ),
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
        internal={row.original.internal ?? false}
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
          onCopyUrl={meta?.copyUrl}
          onDeleteTransaction={meta?.deleteTransaction}
        />
      );
    },
  },
];
