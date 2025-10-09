"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ArchiveIcon,
  Building2,
  CreditCard,
  HandIcon,
  LinkIcon,
  MoreHorizontalIcon,
  Percent,
  ReceiptEuroIcon,
  ReceiptTextIcon,
  SquarePenIcon,
  TrashIcon,
  Wallet2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useState } from "react";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import type { AccountSubtype } from "~/shared/constants/enum";
import { formatDate } from "~/shared/helpers/format";
import { useScopedI18n } from "~/shared/locales/client";
import EditBankAccountDialog from "../sheets/edit-bank-account-dialog";
import { AccountInfoTooltips } from "./account-info-tooltips";

type BankAccount = RouterOutput["asset"]["get"][number];

const ActionsCell = memo(
  ({
    id,
    balance,
    manual,
    onViewDetails,
    onDelete,
  }: {
    id: string;
    balance: number;
    manual: boolean;
    onViewDetails?: (id: string) => void;
    onDelete?: (id: string) => void;
  }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const tScoped = useScopedI18n("bank_account.actions");

    const router = useRouter();

    const handleViewDetails = useCallback(() => {
      onViewDetails?.(id);
    }, [id, onViewDetails]);

    const handleViewTransactions = useCallback(() => {
      router.push(`/transactions?accounts=${id}`);
    }, [id, router]);

    const handleDelete = useCallback(() => {
      onDelete?.(id);
    }, [id, onDelete]);

    return (
      <div className="text-right">
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
              {tScoped("view_details")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewTransactions}>
              <ReceiptEuroIcon className="size-3.5" />
              {tScoped("view_transactions")}
            </DropdownMenuItem>
            {manual && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <SquarePenIcon className="size-3.5" />
                  {tScoped("edit_balance")}
                </DropdownMenuItem>
              </>
            )}
            {manual && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <TrashIcon className="size-3.5" />
                  {tScoped("delete_category")}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <EditBankAccountDialog
          id={id}
          defaultValue={{
            balance: balance,
            date: format(new Date(), "yyyy-MM-dd"),
          }}
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      </div>
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

export const columns: ColumnDef<BankAccount>[] = [
  {
    accessorKey: "name",
    meta: {
      className: "border-r border-border",
    },
    cell: ({ row }) => {
      const account = row.original;

      return (
        <div className="flex items-center gap-3">
          <AccountIcon logoUrl={account.logoUrl ?? ""} />
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 w-full text-ellipsis text-primary md:max-w-none">
              {account.name} {account.description && `- ${account.description}`}
            </span>
          </div>
          <div className="grow"></div>
          <AccountInfoTooltips excludeFromReports={!account.enabled} />
        </div>
      );
    },
  },
  {
    accessorKey: "subtype",
    meta: {
      className: "border-r border-border w-[150px] min-w-[150px]",
    },
    cell: ({ row }) => {
      return (
        <div className="relative w-full">
          <Badge
            variant="tag-rounded"
            className="flex-shrink-0 whitespace-nowrap"
          >
            {row.getValue("subtype")}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "balance",
    accessorKey: "balance",
    meta: {
      className: "w-[150px] min-w-[150px]",
    },
    cell: ({ row }) => {
      const { balance, currency, lastUpdate } = row.original;
      const isPositive = balance > 0;

      return (
        <div className="relative text-right">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "font-medium",
                  isPositive ? "text-green-600" : "text-gray-900",
                )}
              >
                <FormatAmount amount={balance} currency={currency} />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left">
              Ultimo aggiornamento {formatDate(lastUpdate)}
            </TooltipContent>
          </Tooltip>
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
          balance={row.original.balance}
          manual={row.original.manual}
          onViewDetails={meta?.setOpen}
          onDelete={meta?.deleteBankAccount}
        />
      );
    },
  },
];
