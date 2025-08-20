"use client";

import type { RouterOutput } from "~/server/api/trpc/routers/_app";
import type { AccountType } from "~/shared/constants/enum";
import { memo } from "react";
import { FormatAmount } from "~/components/format-amount";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  ArchiveIcon,
  Building2,
  CreditCard,
  HandIcon,
  LinkIcon,
  Percent,
  RotateCcw,
  ShoppingCart,
  Wallet2Icon,
} from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

type BankAccount = RouterOutput["bankAccount"]["get"][number];

// Icon component
const AccountIcon = memo(({ logoUrl }: { logoUrl: string }) => {
  return (
    <Avatar className="size-8 rounded-none">
      <AvatarImage src={logoUrl} alt={`account logo`}></AvatarImage>
      <AvatarFallback className="rounded-none">
        <Wallet2Icon className="size-3" />
      </AvatarFallback>
    </Avatar>
  );
});
AccountIcon.displayName = "AccountIcon";

// Account type badge component
const AccountTypeBadge = memo(({ type }: { type: AccountType }) => {
  const getCategoryStyle = (type: AccountType) => {
    switch (type) {
      // Liquidità
      case "checking":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "savings":
        return "bg-green-50 text-green-700 border-green-200";
      case "cash":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "ewallet":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      // Debiti
      case "credit_card":
        return "bg-pink-50 text-pink-700 border-pink-200";
      case "loan":
        return "bg-red-50 text-red-700 border-red-200";
      case "mortgage":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "other_debt":
        return "bg-rose-50 text-rose-700 border-rose-200";

      // Investimenti
      case "etf":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "stock":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "bond":
        return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
      case "brokerage":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "pension":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "crypto":
        return "bg-gray-100 text-gray-700 border-gray-200";

      // Beni patrimoniali
      case "real_estate":
        return "bg-lime-50 text-lime-700 border-lime-200";
      case "vehicle":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "other_asset":
        return "bg-slate-50 text-slate-700 border-slate-200";

      // Altro
      case "other":
        return "bg-gray-50 text-gray-700 border-gray-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      // Liquidità
      case "checking":
        return <Wallet2Icon className="h-3 w-3" />;
      case "savings":
        return <Percent className="h-3 w-3" />;
      case "cash":
        return <Building2 className="h-3 w-3" />;
      case "ewallet":
        return <CreditCard className="h-3 w-3" />;

      // Debiti
      case "credit_card":
        return <CreditCard className="h-3 w-3" />;
      case "loan":
        return <ArchiveIcon className="h-3 w-3" />;
      case "mortgage":
        return <Building2 className="h-3 w-3" />;
      case "other_debt":
        return <ArchiveIcon className="h-3 w-3" />;

      // Investimenti
      case "etf":
        return <Percent className="h-3 w-3" />;
      case "stock":
        return <Percent className="h-3 w-3" />;
      case "bond":
        return <Percent className="h-3 w-3" />;
      case "brokerage":
        return <Wallet2Icon className="h-3 w-3" />;
      case "pension":
        return <Percent className="h-3 w-3" />;
      case "crypto":
        return <RotateCcw className="h-3 w-3" />;

      // Beni patrimoniali
      case "real_estate":
        return <Building2 className="h-3 w-3" />;
      case "vehicle":
        return <ShoppingCart className="h-3 w-3" />;
      case "other_asset":
        return <ArchiveIcon className="h-3 w-3" />;

      // Altro
      case "other":
        return null;

      default:
        return null;
    }
  };

  // Optionally, you can prettify the label
  const getLabel = (type: AccountType) => {
    switch (type) {
      case "checking":
        return "Checking";
      case "savings":
        return "Savings";
      case "cash":
        return "Cash";
      case "ewallet":
        return "E-Wallet";
      case "credit_card":
        return "Credit Card";
      case "loan":
        return "Loan";
      case "mortgage":
        return "Mortgage";
      case "other_debt":
        return "Other Debt";
      case "etf":
        return "ETF";
      case "stock":
        return "Stock";
      case "bond":
        return "Bond";
      case "brokerage":
        return "Brokerage";
      case "pension":
        return "Pension";
      case "crypto":
        return "Crypto";
      case "real_estate":
        return "Real Estate";
      case "vehicle":
        return "Vehicle";
      case "other_asset":
        return "Other Asset";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getCategoryStyle(type)} flex items-center gap-1 rounded-full`}
    >
      {getIcon(type)}
      {getLabel(type)}
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
    header: () => <div className="pl-2 text-left">ACCOUNT</div>,
    meta: {
      className: "w-full min-w-[200px]",
    },
    cell: ({ row }) => {
      const acocunt = row.original;
      return (
        <div className="flex items-center gap-3">
          <AccountIcon logoUrl={acocunt.logoUrl ?? ""} />
          <div className="flex items-center gap-2">
            <span className="line-clamp-1 font-medium">{acocunt.name}</span>
            {acocunt.deletedAt && (
              <ArchiveIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <div className="pl-1.5 text-left">TYPE</div>,
    meta: {
      className: "w-[180px] min-w-[180px]",
    },
    cell: ({ row }) => <AccountTypeBadge type={row.getValue("type")} />,
  },
  {
    accessorKey: "account",
    header: () => <div className="pl-1 text-left">ORIGIN</div>,
    meta: {
      className: "w-[180px] min-w-[180px]",
    },
    cell: ({ row }) => {
      const account = row.original;
      return (
        <AccountOrigin origin={account.connectionId ? "linked" : "manual"} />
      );
    },
  },
  {
    id: "balance",
    accessorKey: "balance",
    meta: {
      className: "w-[130px] min-w-[130px]",
    },
    header: () => <div className="pr-1.5 text-right">BALANCE</div>,
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
];
