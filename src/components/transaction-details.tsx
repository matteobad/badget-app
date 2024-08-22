"use client";

import {
  type Category,
  type Transaction,
} from "~/app/(dashboard)/banking/transactions/_components/transactions-table";
import { euroFormat } from "~/lib/utils";
import { EditTransactionCategoryForm } from "./forms/edit-bank-transaction-form";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type TransactionDetailsProps = {
  data: Transaction;
  categories: Category[];
};

export function TransactionDetails({
  data,
  categories,
}: TransactionDetailsProps) {
  console.log(data);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Avatar className="h-5 w-5">
          <AvatarImage src={data?.bankAccount.logoUrl ?? ""} />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <span className="text-sm text-slate-500">{data.bankAccount.name}</span>
      </div>
      <div className="flex flex-col">
        <h2 className="text-lg">{data.name}</h2>
        <span className="text-sm text-slate-500">{data.description}</span>
        <span className="mt-4 text-4xl font-semibold">
          {euroFormat(data.amount ?? 0)}
        </span>
      </div>
      <EditTransactionCategoryForm transaction={data} categories={categories} />
    </div>
  );
}
