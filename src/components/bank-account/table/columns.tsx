"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { AccountSubtype } from "~/shared/constants/enum";
import { memo, useCallback } from "react";
import { FormatAmount } from "~/components/format-amount";
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
import { formatDate } from "~/shared/helpers/format";
import { useScopedI18n } from "~/shared/locales/client";
import {
  ArchiveIcon,
  Building2,
  CreditCard,
  HandIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Percent,
  Wallet2Icon,
} from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

type BankAccount = RouterOutput["asset"]["get"][number];

const ActionsCell = memo(
  ({
    id,
    manual,
    onViewDetails,
    onDelete,
  }: {
    id: string;
    manual: boolean;
    onViewDetails?: (id: string) => void;
    onDelete?: (id: string) => void;
  }) => {
    const tScoped = useScopedI18n("bank_account.actions");

    const handleViewDetails = useCallback(() => {
      onViewDetails?.(id);
    }, [id, onViewDetails]);

    const handleDelete = useCallback(() => {
      onDelete?.(id);
    }, [id, onDelete]);

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
            {tScoped("view_details")}
          </DropdownMenuItem>
          {manual && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                {tScoped("delete_category")}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
ActionsCell.displayName = "ActionsCell";

// Icon component
const AccountIcon = memo(({ logoUrl }: { logoUrl: string }) => {
  return (
    <Avatar className="size-6 rounded-none">
      <AvatarImage src={logoUrl} alt={`account logo`}></AvatarImage>
      <AvatarFallback className="rounded-none">
        <Wallet2Icon className="size-3" />
      </AvatarFallback>
    </Avatar>
  );
});
AccountIcon.displayName = "AccountIcon";

// Account type badge component
const AccountTypeBadge = memo(({ subtype }: { subtype: AccountSubtype }) => {
  const getCategoryStyle = (subtype: AccountSubtype) => {
    switch (subtype) {
      // Assets
      case "cash":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "checking":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "savings":
        return "bg-green-50 text-green-700 border-green-200";
      case "investment":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "property":
        return "bg-lime-50 text-lime-700 border-lime-200";

      // Liabilities
      case "credit_card":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "loan":
        return "bg-red-50 text-red-700 border-red-200";
      case "mortgage":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "other_liability":
        return "bg-rose-50 text-rose-700 border-rose-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getIcon = (subtype: AccountSubtype) => {
    switch (subtype) {
      // Liquidità
      case "cash":
        return <Building2 className="h-3 w-3" />;
      case "checking":
        return <Wallet2Icon className="h-3 w-3" />;
      case "savings":
        return <Percent className="h-3 w-3" />;
      case "investment":
        return <CreditCard className="h-3 w-3" />;
      case "property":
        return <CreditCard className="h-3 w-3" />;

      // Debiti
      case "credit_card":
        return <CreditCard className="h-3 w-3" />;
      case "loan":
        return <ArchiveIcon className="h-3 w-3" />;
      case "mortgage":
        return <Building2 className="h-3 w-3" />;
      case "other_liability":
        return <ArchiveIcon className="h-3 w-3" />;

      default:
        return null;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getCategoryStyle(subtype)} flex items-center gap-1 rounded-full`}
    >
      {getIcon(subtype)}
      {subtype}
    </Badge>
  );
});
AccountTypeBadge.displayName = "AccountTypeBadge";

// Account component
const AccountOrigin = memo(({ origin }: { origin: "manual" | "linked" }) => {
  return (
    <div className="flex items-center gap-2">
      {origin === "linked" ? (
        <LinkIcon className="size-4" />
      ) : (
        <HandIcon className="size-4" />
      )}
      <span className="text-sm font-medium">
        {origin === "linked" ? "Connected" : "Manual"}
      </span>
    </div>
  );
});
AccountOrigin.displayName = "AccountOrigin";

// Amount component
const AccountBalance = memo(
  ({ balance, currency }: { balance: number; currency: string }) => {
    const isPositive = balance > 0;

    return (
      <span
        className={`font-medium ${isPositive ? "text-green-600" : "text-gray-900"}`}
      >
        <FormatAmount amount={balance} currency={currency} />
      </span>
    );
  },
);
AccountBalance.displayName = "AccountBalance";

export const columns: ColumnDef<BankAccount>[] = [
  {
    id: "select",
    meta: {
      className: "w-[56px]",
    },
    header: ({ table }) => (
      <Checkbox
        className="ml-3"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    meta: {
      className:
        "md:sticky bg-background group-hover:bg-[#F2F1EF] group-hover:dark:bg-secondary z-10 border-r border-border before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-border after:absolute after:right-[-24px] after:top-0 after:bottom-0 after:w-6 after:bg-gradient-to-l after:from-transparent after:to-background group-hover:after:to-muted after:z-[-1]",
    },
    cell: ({ row }) => {
      const account = row.original;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3">
              <AccountIcon logoUrl={account.logoUrl ?? ""} />
              <div className="flex items-center gap-2">
                <span className="line-clamp-1 w-full max-w-[100px] text-ellipsis md:max-w-none">
                  {account.name}
                </span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {account.description && (
              <TooltipContent
                className="max-w-[380px] px-3 py-1.5 text-xs"
                side="right"
                sideOffset={10}
              >
                {account.description}
              </TooltipContent>
            )}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  {
    accessorKey: "lastUpdate",
    meta: {
      className: "",
    },
    cell: ({ row }) => {
      const date = row.original.lastUpdate;
      return formatDate(date);
    },
  },
  {
    accessorKey: "expiresAt",
    meta: {
      className: "",
    },
    cell: ({ row }) => {
      const date = row.original.expiresAt;
      return date ? formatDate(date) : "-";
    },
  },
  {
    accessorKey: "provider",
    meta: {
      className: "",
    },
    cell: ({ row }) => {
      const provider = row.original.provider;
      return provider;
    },
  },
  {
    id: "balance",
    accessorKey: "balance",
    meta: {
      className: "w-[130px] min-w-[130px]",
    },
    cell: ({ row }) => {
      const acocunt = row.original;

      return (
        <div className="text-right">
          <AccountBalance
            balance={acocunt.balance}
            currency={acocunt.currency}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    meta: {
      className: "w-[56px]",
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta;

      return (
        <ActionsCell
          id={row.original.id}
          manual={row.original.manual}
          onViewDetails={meta?.setOpen}
          onDelete={meta?.deleteBankAccount}
        />
      );
    },
  },
];
