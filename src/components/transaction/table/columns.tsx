"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { dynamicIconImports } from "lucide-react/dynamic";
import { memo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryBadge } from "~/components/category/category-badge";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { CATEGORY_TYPE } from "~/shared/constants/enum";
import { formatDate } from "~/shared/helpers/format";
import { useTRPC } from "~/shared/helpers/trpc/client";
import { MoreHorizontalIcon, RepeatIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

import type { ColumnDef } from "@tanstack/react-table";

type Transaction = RouterOutput["transaction"]["get"]["data"][number];

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
    status,
  }: {
    name: string;
    description?: string;
    status?: string;
    counterpartyLogo?: string;
    recurring?: boolean | null;
  }) => (
    <div className="flex items-center space-x-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-full items-center justify-between space-x-2">
            <Avatar className="size-8">
              <AvatarImage
                src={counterpartyLogo ?? ""}
                className="object-contain"
              />
              <AvatarFallback className="rounded-full">
                {name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="line-clamp-1 max-w-[100px] text-ellipsis md:max-w-none">
              {name}
            </span>
            {recurring && (
              <RepeatIcon className="size-3.5 text-muted-foreground" />
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
  ({ amount, currency }: { amount: number; currency: string }) => (
    <div className="w-full text-right">
      <span className={cn("text-sm", amount > 0 && "text-green-600")}>
        <FormatAmount amount={amount} currency={currency} />
      </span>
    </div>
  ),
);

AmountCell.displayName = "AmountCell";

const CategoryCell = memo(
  ({
    id,
    category,
    onUpdateTransactionCategory,
  }: {
    id: string;
    category?: {
      id: string;
      slug: string;
      name: string;
      color: string | null;
      icon: string | null;
    };
    onUpdateTransactionCategory?: (data: {
      id: string;
      categoryId?: string;
    }) => void;
  }) => {
    const trpc = useTRPC();
    const { data: categories } = useQuery({
      ...trpc.category.get.queryOptions({}),
    });

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-0">
            <CategoryBadge category={category} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {categories && categories.length > 0 ? (
            Object.values(CATEGORY_TYPE).map((categoryType) => {
              return (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground capitalize">
                    {categoryType}
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {categories
                      .filter(({ type }) => type === categoryType)
                      .map((category) => (
                        <DropdownMenuItem
                          key={category.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            onUpdateTransactionCategory?.({
                              id,
                              categoryId: category.id,
                            });
                          }}
                        >
                          <DynamicIcon
                            name={
                              category.icon as keyof typeof dynamicIconImports
                            }
                            size={16}
                            aria-hidden="true"
                          />
                          {category.name}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                </>
              );
            })
          ) : (
            <p className="px-2 text-sm text-[#878787]">No categories found</p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
    onUpdateTransaction,
    onDeleteTransaction,
  }: {
    transaction: Transaction;
    onViewDetails?: (id: string) => void;
    onCopyUrl?: (id: string) => void;
    onUpdateTransaction?: (data: { id: string; status: string }) => void;
    onDeleteTransaction?: (id: string) => void;
  }) => {
    const handleViewDetails = useCallback(() => {
      onViewDetails?.(transaction.id);
    }, [transaction.id, onViewDetails]);

    const handleCopyUrl = useCallback(() => {
      onCopyUrl?.(transaction.id);
    }, [transaction.id, onCopyUrl]);

    const handleUpdateToPosted = useCallback(() => {
      onUpdateTransaction?.({ id: transaction.id, status: "posted" });
    }, [transaction.id, onUpdateTransaction]);

    const handleUpdateToExcluded = useCallback(() => {
      onUpdateTransaction?.({ id: transaction.id, status: "excluded" });
    }, [transaction.id, onUpdateTransaction]);

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
          {!transaction.manual && transaction.status === "excluded" && (
            <DropdownMenuItem onClick={handleUpdateToPosted}>
              Include
            </DropdownMenuItem>
          )}

          {!transaction.manual && transaction.status !== "excluded" && (
            <DropdownMenuItem onClick={handleUpdateToExcluded}>
              Exclude
            </DropdownMenuItem>
          )}

          {transaction.manual && (
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
        // @ts-expect-error - TODO: fix this
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        format={table.options.meta?.dateFormat}
        // @ts-expect-error - TODO: fix this
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
      />
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    meta: {
      className: "border-l border-border",
    },
    cell: ({ row, table }) => (
      <CategoryCell
        id={row.original.id}
        category={row.original.category!}
        onUpdateTransactionCategory={
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          table.options.meta?.updateTransactionCategory
        }
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
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onViewDetails={meta?.setOpen}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onCopyUrl={meta?.copyUrl}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onUpdateTransaction={meta?.updateTransaction}
          // @ts-expect-error - TODO: fix this
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onDeleteTransaction={meta?.onDeleteTransaction}
        />
      );
    },
  },
];
