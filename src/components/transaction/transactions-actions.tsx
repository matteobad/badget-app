"use client";

import { AddTransactionButton } from "~/components/transaction/add-transaction-button";

import { TransactionsColumnVisibility } from "./transactions-column-visibility";

export function TransactionsActions() {
  return (
    <div className="hidden space-x-2 md:flex">
      <TransactionsColumnVisibility />
      <AddTransactionButton label="Aggiungi" />
    </div>
  );
}
