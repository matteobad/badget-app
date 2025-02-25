"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import {
  ArrowUpRight,
  BanknoteIcon,
  CreditCard,
  LayersIcon,
  PiggyBankIcon,
  Wallet2Icon,
} from "lucide-react";

import { cn } from "~/lib/utils";
import { type AccountType } from "~/server/db/schema/enum";

const iconVariants = cva("rounded-lg", {
  variants: {
    size: {
      default: "p-2 [&>svg]:size-4",
      sm: "p-1 [&>svg]:size-3.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export default function AccountIcon({
  type,
  size,
  className,
}: React.ComponentProps<"div"> &
  VariantProps<typeof iconVariants> & { type: AccountType }) {
  return (
    <div
      className={cn(iconVariants({ size }), className, {
        "bg-emerald-100 dark:bg-emerald-900/30": type === "savings",
        "bg-blue-100 dark:bg-blue-900/30": type === "checking",
        "bg-purple-100 dark:bg-purple-900/30": type === "investment",
        "bg-red-100 dark:bg-red-900/30": type === "debt",
        "bg-yellow-100 dark:bg-yellow-900/30": type === "cash",
        "bg-slate-100 dark:bg-slate-900/30": type === "other",
      })}
    >
      {type === "savings" && (
        <PiggyBankIcon className="text-emerald-600 dark:text-emerald-400" />
      )}
      {type === "checking" && (
        <LayersIcon className="text-blue-600 dark:text-blue-400" />
      )}
      {type === "investment" && (
        <ArrowUpRight className="text-purple-600 dark:text-purple-400" />
      )}
      {type === "debt" && (
        <CreditCard className="text-red-600 dark:text-red-400" />
      )}
      {type === "cash" && (
        <BanknoteIcon className="text-yellow-600 dark:text-yellow-400" />
      )}
      {type === "other" && (
        <Wallet2Icon className="text-slate-600 dark:text-slate-400" />
      )}
    </div>
  );
}
