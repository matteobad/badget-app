import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Plus,
  QrCode,
  SendHorizontal,
  Wallet,
} from "lucide-react";

import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

interface AccountItem {
  id: string;
  title: string;
  description?: string;
  balance: string;
  type: "savings" | "checking" | "investment" | "debt";
}

interface List01Props {
  totalBalance?: string;
  accounts?: AccountItem[];
  className?: string;
}

const ACCOUNTS: AccountItem[] = [
  {
    id: "1",
    title: "Liquidità",
    description: "Personal savings",
    balance: "$8,459.45",
    type: "checking",
  },
  {
    id: "2",
    title: "Fondo di emergenza",
    description: "Daily expenses",
    balance: "$2,850.00",
    type: "savings",
  },
  {
    id: "3",
    title: "Obiettivi a breve",
    description: "Stock & ETFs",
    balance: "$15,230.80",
    type: "investment",
  },
  {
    id: "4",
    title: "Investimenti",
    description: "Pending charges",
    balance: "$1,200.00",
    type: "investment",
  },
  {
    id: "5",
    title: "Beni patrimoniali",
    description: "Emergency fund",
    balance: "$3,000.00",
    type: "savings",
  },
  {
    id: "6",
    title: "Passività",
    description: "Emergency fund",
    balance: "$3,000.00",
    type: "debt",
  },
];

export default function AccountList({
  totalBalance = "$26,540.25",
  accounts = ACCOUNTS,
  className,
}: List01Props) {
  return (
    <Card
      className={cn(
        "mx-auto w-full max-w-xl",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        className,
      )}
    >
      {/* Total Balance Section */}
      <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Patrimonio complessivo
        </p>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {totalBalance}
        </h1>
      </div>

      {/* Accounts List */}
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            Your Accounts
          </h2>
        </div>

        <div className="space-y-1">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                "group flex items-center justify-between",
                "rounded-lg p-2",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                "transition-all duration-200",
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn("rounded-lg p-1.5", {
                    "bg-emerald-100 dark:bg-emerald-900/30":
                      account.type === "savings",
                    "bg-blue-100 dark:bg-blue-900/30":
                      account.type === "checking",
                    "bg-purple-100 dark:bg-purple-900/30":
                      account.type === "investment",
                  })}
                >
                  {account.type === "savings" && (
                    <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {account.type === "checking" && (
                    <QrCode className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  {account.type === "investment" && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  )}
                  {account.type === "debt" && (
                    <CreditCard className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {account.title}
                  </h3>
                  {account.description && (
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {account.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  {account.balance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Updated footer with four buttons */}
      <div className="border-t border-zinc-100 p-2 dark:border-zinc-800">
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-2",
              "rounded-lg px-3 py-2",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200",
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-2",
              "rounded-lg px-3 py-2",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200",
            )}
          >
            <SendHorizontal className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-2",
              "rounded-lg px-3 py-2",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200",
            )}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            <span>Top-up</span>
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center gap-2",
              "rounded-lg px-3 py-2",
              "text-xs font-medium",
              "bg-zinc-900 dark:bg-zinc-50",
              "text-zinc-50 dark:text-zinc-900",
              "hover:bg-zinc-800 dark:hover:bg-zinc-200",
              "shadow-sm hover:shadow",
              "transition-all duration-200",
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>More</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
